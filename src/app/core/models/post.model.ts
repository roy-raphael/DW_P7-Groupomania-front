import { Comment } from "./comment.model";
import { User } from "./user.model";

export class Post {
    id!: string;
    createdAt!: Date;
    updatedAt!: Date;
    text!: string;
    imageUrl?: string;
    authorId!: string;
    author!: User;
    likes!: number;
    dislikes!: number;
    comments!: Comment[];
}