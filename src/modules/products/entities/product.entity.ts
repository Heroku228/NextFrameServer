import { User } from 'src/modules/users/entities/user.entity'
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity('products')
export class Product {
	@PrimaryGeneratedColumn('uuid')
	id: string

	@Column()
	title: string

	@Column()
	description: string

	@Column({ type: 'simple-array' })
	pathToProductIcons: string[]

	@Column({ default: false })
	isHidden: boolean

	@Column('decimal')
	price: number

	@ManyToOne(() => User, user => user.products)
	seller: User

	@CreateDateColumn()
	createdAt: Date
	@UpdateDateColumn()
	updatedAt: Date
}
