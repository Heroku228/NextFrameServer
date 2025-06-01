import { Body, Controller, Get, NotFoundException, Param, Post, Res, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { FilesInterceptor } from '@nestjs/platform-express'
import { plainToInstance } from 'class-transformer'
import { CurrentUser } from 'common/decorators/current-user.decorator'
import { UserDirectory } from 'common/decorators/user-directory.decorator'
import { SellerGuard } from 'common/guards/SellerGuards.guard'
import { Response } from 'express'
import { existsSync } from 'fs'
import { CreateProductDto } from 'microservices/products-microservice/dto/create-product.dto'
import { ResponseProductDto } from 'microservices/products-microservice/dto/response-product.dto'
import { ProductsService } from 'microservices/products-microservice/products.service'
import { UserResponseDto } from 'microservices/users-microservice/entities/dto/user-response.dto'
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
