import { Comment } from "./comment.model";
import { User } from "./user.model";

export class Post {
    id!: string;
    createdAt!: Date;
    updatedAt!: Date;
    text!: string;
    imageUrl?: string;
    imageAlt?: string;
    authorId!: string;
    author!: User;
    likes!: {id: string}[];
    likesNumber?: number;
    userLiked?: boolean;
    comments!: Comment[];
    canEditAndDelete?: boolean;
}