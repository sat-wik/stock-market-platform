const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    app.use(
        '/api',
        createProxyMiddleware({
            target: 'https://past-crimson-primrose.glitch.me',
            changeOrigin: true,
            secure: false,
            headers: {
                Connection: 'keep-alive'
            },
            onProxyRes: function(proxyRes, req, res) {
                proxyRes.headers['access-control-allow-origin'] = '*';
            }
        })
    );
};
