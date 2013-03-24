var path = require('path'),
    resolve = path.resolve,
    join = path.join;

exports.themes_root = resolve(__dirname, '..', '..', 'captain', 'themes');
exports.theme = 'default';
exports.theme_root = join(exports.themes_root, exports.theme);
exports.template_dir = join(exports.theme_root, 'templates');
exports.static_root = join(exports.theme_root, 'public');
exports.db = "tcp://shinuza@localhost/shinuza";
exports.site_id = "d73ec817-2c2a-4be0-ba04-9d668690b83e";
exports.secret_key = "SOKcM228ciZ5WdwNHJMOIhQfHgD6vIMkm5kEUmlQsnXpAXJrRk7LId8G8eOLzNCvi6wUDsGS/iHnptmA/Tu8OA==";