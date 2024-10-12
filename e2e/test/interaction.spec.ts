import { expect } from '@wdio/globals';
import { browser } from 'wdio-electron-service';
import { setupBrowser, type WebdriverIOQueries } from '@testing-library/webdriverio';

describe('application loading', () => {
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
  });
});
