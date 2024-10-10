import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./user.model";

@Entity("bazars")
export class Bazar {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    description?: string;

    @Column("double")
    cost?: number;

    @Column()
    date?: Date;

    @ManyToOne(() => User, user => user.bazars)
    user?: User;

    @Column({nullable: false})
    messId?: number; // Loose relation to mess
}
