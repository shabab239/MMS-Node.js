import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./user.model";

@Entity("bills")
export class Bill {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column("decimal")
    mealCost?: number;

    @Column("decimal")
    utilityCost?: number;

    @Column("decimal")
    finalAmount?: number; // Final amount owed or credit

    @Column()
    month?: number;

    @Column()
    year?: number;

    @ManyToOne(() => User, user => user.bills)
    user?: User;

    @Column({nullable: false})
    messId?: number; // Loose relation to mess
}
