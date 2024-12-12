const path = require('path');
const baseDir = path.join('C:', 'path', 'to', 'this', 'folder');

module.exports = {
  apps: [
    {
      name: 'sct-base-port-8071',
      script: path.join(baseDir, 'sct-base.exe'),
      args: '-port 8071',
    },
    {
      name: 'sct-base-port-8072',
      script: path.join(baseDir, 'sct-base.exe'),
      args: '-port 8072',
    },
    {
      name: 'sct-base-port-8073',
      script: path.join(baseDir, 'sct-base.exe'),
      args: '-port 8073',
    },
    {
      name: 'sct-base-port-8074',
      script: path.join(baseDir, 'sct-base.exe'),
      args: '-port 8074',
    },
  ],
};
