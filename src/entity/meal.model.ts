import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./user.model";

@Entity("meals")
export class Meal {
    @PrimaryGeneratedColumn()
    id?: number;

    @ManyToOne(() => User, user => user.meals)
    user?: User;

    @Column()
    month?: number;

    @Column()
    year?: number;

    @Column({default: 0})
    day1?: number; // Meals eaten on the 1st day

    @Column({default: 0})
    day2?: number; // Meals eaten on the 2nd day

    @Column({default: 0})
    day3?: number; // Meals eaten on the 3rd day

    @Column({default: 0})
    day4?: number; // Meals eaten on the 4th day

    @Column({default: 0})
    day5?: number; // Meals eaten on the 5th day

    @Column({default: 0})
    day6?: number; // Meals eaten on the 6th day

    @Column({default: 0})
    day7?: number; // Meals eaten on the 7th day

    @Column({default: 0})
    day8?: number; // Meals eaten on the 8th day

    @Column({default: 0})
    day9?: number; // Meals eaten on the 9th day

    @Column({default: 0})
    day10?: number; // Meals eaten on the 10th day

    @Column({default: 0})
    day11?: number; // Meals eaten on the 11th day

    @Column({default: 0})
    day12?: number; // Meals eaten on the 12th day

    @Column({default: 0})
    day13?: number; // Meals eaten on the 13th day

    @Column({default: 0})
    day14?: number; // Meals eaten on the 14th day

    @Column({default: 0})
    day15?: number; // Meals eaten on the 15th day

    @Column({default: 0})
    day16?: number; // Meals eaten on the 16th day

    @Column({default: 0})
    day17?: number; // Meals eaten on the 17th day

    @Column({default: 0})
    day18?: number; // Meals eaten on the 18th day

    @Column({default: 0})
    day19?: number; // Meals eaten on the 19th day

    @Column({default: 0})
    day20?: number; // Meals eaten on the 20th day

    @Column({default: 0})
    day21?: number; // Meals eaten on the 21st day

    @Column({default: 0})
    day22?: number; // Meals eaten on the 22nd day

    @Column({default: 0})
    day23?: number; // Meals eaten on the 23rd day

    @Column({default: 0})
    day24?: number; // Meals eaten on the 24th day

    @Column({default: 0})
    day25?: number; // Meals eaten on the 25th day

    @Column({default: 0})
    day26?: number; // Meals eaten on the 26th day

    @Column({default: 0})
    day27?: number; // Meals eaten on the 27th day

    @Column({default: 0})
    day28?: number; // Meals eaten on the 28th day

    @Column({default: 0})
    day29?: number; // Meals eaten on the 29th day

    @Column({default: 0})
    day30?: number; // Meals eaten on the 30th day

    @Column({default: 0})
    day31?: number; // Meals eaten on the 31st day

    @Column({nullable: false})
    messId?: number; // Loose relation to mess
}
