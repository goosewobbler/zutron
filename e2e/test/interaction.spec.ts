import { expect } from '@wdio/globals';
import { browser } from 'wdio-electron-service';
import { setupBrowser, type WebdriverIOQueries } from '@testing-library/webdriverio';

const windowHandles = new Map<string, string>();

const waitUntilWindowsAvailable = async (desiredWindows: number) =>
  await browser.waitUntil(async () => {
    const handles = await browser.getWindowHandles();
    for (const handle of handles) {
      await browser.switchToWindow(handle);
      const title = await browser.getTitle();
      windowHandles.set(title, handle);
    }
    return handles.length === desiredWindows;
  });

const switchToWindow = async (windowName: string) => {
  await browser.switchToWindow(windowHandles.get(windowName) as string);
};

let screen: WebdriverIOQueries;

before(() => {
  screen = setupBrowser(browser);
});

describe('click events', () => {
  it('should increment the counter', async () => {
    const incrementButton = await screen.getByText('increment');

    await incrementButton.click();
    expect(await screen.getByText('1')).toBeDefined();
    await incrementButton.click();
    expect(await screen.getByText('2')).toBeDefined();
    await incrementButton.click();
    expect(await screen.getByText('3')).toBeDefined();
  });

  it('should decrement the counter', async () => {
    const decrementButton = await screen.getByText('decrement');

    await decrementButton.click();
    expect(await screen.getByText('2')).toBeDefined();
    await decrementButton.click();
    expect(await screen.getByText('1')).toBeDefined();
    await decrementButton.click();
    expect(await screen.getByText('0')).toBeDefined();
  });

  // Setting badge count is supported on macOS and Linux
  // However, Linux support is limited to Unity, which is not the default desktop environment for Ubuntu
  if (process.platform === 'darwin') {
    it('should increment the badgeCount', async () => {
      let badgeCount: number;
      const incrementButton = await screen.getByText('increment');

      await incrementButton.click();
      badgeCount = await browser.electron.execute((electron) => {
        return electron.app.getBadgeCount();
      });

      expect(badgeCount).toBe(1);

      await incrementButton.click();
      badgeCount = await browser.electron.execute((electron) => {
        return electron.app.getBadgeCount();
      });

      expect(badgeCount).toBe(2);

      await incrementButton.click();
      badgeCount = await browser.electron.execute((electron) => {
        return electron.app.getBadgeCount();
      });

      expect(badgeCount).toBe(3);
    });

    it('should decrement the badgeCount', async () => {
      let badgeCount: number;
      const decrementButton = await screen.getByText('decrement');

      await decrementButton.click();
      badgeCount = await browser.electron.execute((electron) => {
        return electron.app.getBadgeCount();
      });

      expect(badgeCount).toBe(2);

      await decrementButton.click();
      badgeCount = await browser.electron.execute((electron) => {
        return electron.app.getBadgeCount();
      });

      expect(badgeCount).toBe(1);

      await decrementButton.click();
      badgeCount = await browser.electron.execute((electron) => {
        return electron.app.getBadgeCount();
      });

      expect(badgeCount).toBe(0);
    });
  }

  describe('in an app with a second window created at runtime', () => {
    beforeEach(async () => {
      await waitUntilWindowsAvailable(2);
      await switchToWindow('zutron main window');
    });

    it('should increment the counter in the other window when the main window increment button is clicked', async () => {
      const incrementButton = await screen.getByText('increment');

      await incrementButton.click();
      await switchToWindow('zutron runtime window');
      expect(await screen.getByText('1')).toBeDefined();
      await switchToWindow('zutron main window');
      await incrementButton.click();
      await switchToWindow('zutron runtime window');
      expect(await screen.getByText('2')).toBeDefined();
      await switchToWindow('zutron main window');
      await incrementButton.click();
      await switchToWindow('zutron runtime window');
      expect(await screen.getByText('3')).toBeDefined();
    });

    it('should decrement the counter in the other window when the main window decrement button is clickede', async () => {
      const decrementButton = await screen.getByText('decrement');

      await decrementButton.click();
      await switchToWindow('zutron runtime window');
      expect(await screen.getByText('2')).toBeDefined();
      await switchToWindow('zutron main window');
      await decrementButton.click();
      await switchToWindow('zutron runtime window');
      expect(await screen.getByText('1')).toBeDefined();
      await switchToWindow('zutron main window');
      await decrementButton.click();
      await switchToWindow('zutron runtime window');
      expect(await screen.getByText('0')).toBeDefined();
    });
  });
});
