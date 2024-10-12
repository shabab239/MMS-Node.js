import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity("messes")
export class Mess {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column({length: 150, nullable: false})
    name?: string;

    @Column("decimal", {default: 0})
    balance?: number;
}
