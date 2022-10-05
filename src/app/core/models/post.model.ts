import { Comment } from "./comment.model";

export class Post {
    id!: string;
    createdAt!: Date;
    updatedAt!: Date;
    text!: string;
    imageUrl?: string;
    authorId!: string;
    likes!: number;
    dislikes!: number;
    comments!: Comment[];
}