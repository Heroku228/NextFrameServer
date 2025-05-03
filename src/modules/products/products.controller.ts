import { Body, Controller, Get, Param, Post, Res, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { FilesInterceptor } from '@nestjs/platform-express'
import { Response } from 'express'
import { join } from 'path'
import { CurrentUser } from 'src/common/decorators/current-user.decorator'
import { UserDirectory } from 'src/common/decorators/user-directory.decorator'
import { SellerGuard } from 'src/common/guards/SellerGuards.guard'
import { UserResponseDto } from '../users/entities/dto/user-response.dto'
import { CreateProductDto } from './dto/create-product.dto'
import { ProductsService } from './products.service'

@UseGuards(AuthGuard('jwt'), SellerGuard)
@Controller('products')
export class ProductsController {
	constructor(private readonly productsService: ProductsService) { }

	@UseInterceptors(FilesInterceptor('images'))
	@Post('create-product')
	async create(
		@CurrentUser() user: UserResponseDto,
		@UploadedFiles() images: Express.Multer.File[],
		@UserDirectory() directory: string,
		@Body() createProductDto: CreateProductDto
	) {
		const product = await this.productsService.createProduct(createProductDto, directory, images, user.id)
		return product
	}

	@Get('products-images')
	async findAllProductsImages(
		@CurrentUser() user: UserResponseDto,
		@Res() res: Response
	) {
		const productImages = await this.productsService.findAllProductImages(user.username)
		return res.json(productImages)
	}

	@Get('product-image/:filename')
	async getProductImageByFilename(
		@CurrentUser() user: UserResponseDto,
		@Param('filename') filename: string,
		@Res() res: Response
	) {
		const pathToFile = join(process.cwd(), 'uploads', user.username, 'products-images', filename)
		return res.sendFile(pathToFile)
	}
}
