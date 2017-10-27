#!/usr/bin/env node

const bulbo = require('bulbo');
const { action, loggerTitle, asset, dest, name, on, port } = require('berber');
const layout1 = require('layout1');
const rename = require('gulp-rename');
const { readFileSync } = require('fs');
const { join } = require('path');
require('require-yaml');
const livereload = require('livereload');
var liveServer = null;
const assets = ['.'];

const live = process.argv.length === 2; // this is crap

const script = readFileSync(join(__dirname, 'vendor/remark.js'));
const defaultCss = readFileSync(join(__dirname, 'vendor/remark.css'));
const layoutFilename = join(__dirname, 'layout-updated.njk');

const cwd = process.cwd();

action('serve', () => {
  liveServer = livereload.createServer({
    exts: ['md', 'js', 'css'],
  });
  liveServer.watch(assets);
  bulbo.serve();
});

name('remarker');
loggerTitle('remarker');

on('config', config => {
  config = config || {};

  port(config.port || 6275);
  dest(config.dest || 'build');

  if (config.stylesheet) {
    asset(config.stylesheet).base(cwd);
    assets.push(config.stylesheet);
  }

  asset(join(__dirname, 'vendor/remark.js')).base(__dirname);

  asset(config.source || 'slides.md')
    .pipe(rename({ basename: 'index', extname: '.html' }))
    .pipe(
      layout1.nunjucks(layoutFilename, {
        data: {
          script,
          live,
          css: config.css || defaultCss,
          title: config.title || '',
          stylesheet: config.stylesheet || false,
          remarkConfig: config.remarkConfig || {},
        },
      })
    );

  (config.assets || ['assets']).forEach(src => {
    assets.push(join(cwd, src));
    asset(join(src, '**/*.*')).base(cwd);
  });
});
