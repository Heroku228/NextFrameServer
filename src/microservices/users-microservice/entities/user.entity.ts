import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import '../../../constants/Roles'

@Entity('user')
export class User {
	@PrimaryGeneratedColumn('uuid')
	id: string

	@Column({ unique: true })
	email: string

	@Column({ unique: true })
	username: string

	@Column({ nullable: true })
	hashedRefreshToken: string

	@Column({ default: false })
	isBanned: boolean
	@Column({ default: false })
	isSeller: boolean

	// @OneToMany(() => Product, product => product.seller)
	// products: Product[]

	@Column({ nullable: true })
	pathToUserIcon: string

	@Column({ type: 'simple-array' })
	roles: string[] = ['user']

	@Column()
	password: string

	@CreateDateColumn()
	createdAt: Date

	@UpdateDateColumn()
	updatedAt: Date
}
