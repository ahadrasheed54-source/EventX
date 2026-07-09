"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageUploadOptions = void 0;
const multer_1 = require("multer");
const path_1 = require("path");
const common_1 = require("@nestjs/common");
function generateFileName(file) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    return `${uniqueSuffix}${(0, path_1.extname)(file.originalname)}`;
}
exports.imageUploadOptions = {
    storage: (0, multer_1.diskStorage)({
        destination: './uploads/events',
        filename: (_req, file, callback) => {
            callback(null, generateFileName(file));
        },
    }),
    fileFilter: (_req, file, callback) => {
        const allowed = /jpg|jpeg|png|webp/;
        const isValid = allowed.test((0, path_1.extname)(file.originalname).toLowerCase());
        if (!isValid) {
            return callback(new common_1.BadRequestException('Only image files are allowed (jpg, jpeg, png, webp)'), false);
        }
        callback(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 },
};
//# sourceMappingURL=multer.config.js.map