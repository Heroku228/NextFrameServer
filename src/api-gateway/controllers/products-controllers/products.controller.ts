import { Controller, Get, NotFoundException, Param, Res, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { CurrentUser } from 'common/decorators/current-user.decorator'
import { SellerGuard } from 'common/guards/SellerGuards.guard'
import { Response } from 'express'
import { existsSync } from 'fs'
import { ProductsService } from 'microservices/products-microservice/products.service'
import { join } from 'path'
import { ICurrentUser } from 'types/current-user.type'

@UseGuards(AuthGuard('jwt'), SellerGuard)
@Controller('products')
export class ProductsController {
	constructor(private readonly productsService: ProductsService,) { }

	// @UseInterceptors(FilesInterceptor('images'))
	// @Post('create-product')
	// async create(
	// 	@CurrentUser() user: ICurrentUser,
	// 	@UploadedFiles() images: Express.Multer.File[],
	// 	@UserDirectory() directory: string,
	// 	@Body() createProductDto: CreateProductDto
	// ) {
	// 	const product = await this.productsService.createProduct(
	// 		createProductDto,
	// 		directory,
	// 		images,
	// 		user
	// 	)
	// 	console.log(product)

	// 	return plainToInstance(ResponseProductDto, product)
	// }

	@Get('products-images')
	async findAllProductsImages(@CurrentUser() user: ICurrentUser) {
		return await this.productsService.findAllProductImages(user.username)
	}

	@Get('product-image/:filename')
	async getProductImageByFilename(
		@CurrentUser() user: ICurrentUser,
		@Param('filename') filename: string,
		@Res() res: Response
	) {
		const pathToFile = join(process.cwd(), 'uploads', user.username, 'products-images', filename)

		if (!existsSync(pathToFile))
			throw new NotFoundException('The directory doesnt exists')

		return res.sendFile(pathToFile)
	}

}
