import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity("utilities")
export class Utility {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column("decimal")
    amount?: number;

    @Column()
    month?: number;

    @Column()
    year?: number;

    @Column({nullable: false})
    messId?: number; // Loose relation to mess

}
