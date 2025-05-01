import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'


@Entity('user')
export class User {
	@PrimaryGeneratedColumn('uuid')
	id: string

	@Column({ unique: true })
	email: string

	@Column({ unique: true })
	username: string

	@Column()
	pathToUserIcon: string

	@Column()
	password: string

	@CreateDateColumn()
	createdAt: Date

	@UpdateDateColumn()
	updatedAt: Date
}
