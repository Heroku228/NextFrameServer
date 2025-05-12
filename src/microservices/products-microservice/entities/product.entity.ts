import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity('products')
export class Product {
	@PrimaryGeneratedColumn('uuid')
	id: string

	@Column()
	title: string

	@Column()
	description: string

	@Column({ type: 'simple-array', nullable: true })
	pathToProductIcons: string[]

	@Column({ default: false })
	isHidden: boolean

	@Column('decimal')
	price: number

	@Column('uuid')
	sellerId: string

	@CreateDateColumn()
	createdAt: Date
	@UpdateDateColumn()
	updatedAt: Date
}
