import { User } from "./user.model";

export class Comment {
    id!: string;
    createdAt!: Date;
    text!: string;
    authorId!: string;
    author!: User;
    postId!: string;
}