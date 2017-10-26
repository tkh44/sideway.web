import { jsdom } from 'jsdom';
import 'isomorphic-fetch';
require('mock-local-storage');

global.React = require('react')

global.document = jsdom('<!doctype html><html><body></body></html>');
global.window = document.defaultView;
global.navigator = global.window.navigator;
global.window.localStorage = global.localStorage;
global.__DEVELOPMENT__ = global.window.__DEVELOPMENT__ = false;
global.__TEST__ = global.window.__TEST__ = true;
global.window.sideway = { server: { api: '' } };
