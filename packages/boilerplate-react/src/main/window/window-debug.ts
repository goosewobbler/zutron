/* eslint global-require: off */
export const windowDebug = async () => {
  const env = process.env.NODE_ENV;

  if (process.env.NODE_ENV === 'production') {
    const sourceMapSupport = require('source-map-support');
    sourceMapSupport.install();
  }

  const isDebug = env === 'development' || process.env.DEBUG_PROD === 'true';
  if (!isDebug) return;

  const installer = require('electron-devtools-assembler');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return (
    installer
      .default(
        extensions.map((name) => installer[name]),
        forceDownload
      )
      // eslint-disable-next-line no-console
      .catch(console.error)
  );
};
