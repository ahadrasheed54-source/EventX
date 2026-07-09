"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FavoritesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../users/schemas/user.schema");
let FavoritesService = class FavoritesService {
    constructor(userModel) {
        this.userModel = userModel;
    }
    async list(userId) {
        const user = await this.userModel.findById(userId).populate({
            path: 'favorites',
            populate: { path: 'category', select: 'name' },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user.favorites;
    }
    async toggle(userId, eventId) {
        const user = await this.userModel.findById(userId);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const index = user.favorites.findIndex((id) => id.toString() === eventId);
        let isFavorite;
        if (index === -1) {
            user.favorites.push(eventId);
            isFavorite = true;
        }
        else {
            user.favorites.splice(index, 1);
            isFavorite = false;
        }
        await user.save();
        return { isFavorite };
    }
};
exports.FavoritesService = FavoritesService;
exports.FavoritesService = FavoritesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], FavoritesService);
//# sourceMappingURL=favorites.service.js.map