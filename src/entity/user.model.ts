import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Meal} from "./meal.model";
import {UserRole} from "./user.role.model";
import {Bazar} from "./bazar.model";
import {Bill} from "./bill.model";
import {IsNotEmpty, IsString} from "class-validator";

@Entity("users")
export class User {

    @PrimaryGeneratedColumn()
    id?: number;

    @IsString()
    @Column({nullable: false, length: 150})
    name?: string;

    @IsNotEmpty()
    @Column({unique: true, length: 11, nullable: false})
    cell?: string;

    @Column({nullable: false})
    password?: string;

    @Column({
        type: "enum",
        enum: UserRole,
        default: UserRole.MEMBER,
    })
    role?: UserRole;

    @OneToMany(() => Meal, meal => meal.user)
    meals?: Meal[];

    @OneToMany(() => Bazar, bazar => bazar.user)
    bazars?: Bazar[];

    @OneToMany(() => Bill, bill => bill.user)
    bills?: Bill[];

    @Column({nullable: false})
    messId?: number; // Loose relation to mess

}

