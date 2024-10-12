import {Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Meal} from "./meal.model";
import {UserRole} from "./user.role";
import {Bazar} from "./bazar.model";
import {Bill} from "./bill.model";
import {IsNotEmpty, IsString} from "class-validator";
import {User} from "./user.model";
import {TransactionType} from "./transaction.type";

@Entity("transactions")
export class Transaction {

    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    date?: Date;

    @Column("decimal")
    amount?: number;

    @Column({
        type: "enum",
        enum: TransactionType
    })
    type?: TransactionType;

    @ManyToOne(() => User, user => user.transactions)
    user?: User;

    @Column({nullable: false})
    messId?: number; // Loose relation to mess

}

