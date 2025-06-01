import { BadRequestException, Controller, ForbiddenException, NotFoundException, Param, Patch, Query, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { FileInterceptor } from '@nestjs/platform-express'
import { plainToInstance } from 'class-transformer'
import { CurrentUser } from 'common/decorators/current-user.decorator'
import { SellerGuard } from 'common/guards/SellerGuards.guard'
import { uploadFile } from 'common/utils/uploads-images.utils'
import { FILE_SYSTEM_ROUTES } from 'constants/Routes'
import { Response } from 'express'
import { existsSync } from 'fs'
import { ResponseProductDto } from 'microservices/products-microservice/dto/response-product.dto'
import { ProductsService } from 'microservices/products-microservice/products.service'
import { join } from 'path'
import { ICurrentUser } from 'types/current-user.type'

@UseGuards(AuthGuard('jwt'), SellerGuard)
@Controller('products')
export class UpdateProductsDataController {
	constructor(private readonly productsService: ProductsService) { }

	@Patch('update-product')
	async updateProductDescription(
		@Query('productId') productId: string,
		@Query('description') description?: string,
		@Query('title') title?: string,
		@Query('price') price?: string
	) {
		return await this.productsService.updateProductData(
			productId,
			description,
			title,
			price ? parseFloat(price) : undefined
		)
	}


	@Patch('hide-product/:productId')
	async hideProductById(
		@Param('productId') productId: string,
		@CurrentUser() user: ICurrentUser,
		@Res() res: Response
	) {
		if (!user) throw new ForbiddenException()
		const changedProduct = await this.productsService.hideProductById(productId)
		if (!changedProduct) throw new BadRequestException()
		return res.status(200).json('Product is was hidden')
	}

	@Patch('add-product-image/:productId')
	@UseInterceptors(FileInterceptor('icon'))
	async addImageToProduct(
		@CurrentUser() user: ICurrentUser,
		@UploadedFile() file: Express.Multer.File,
		@Param('productId') productId: string
	) {
		const pathToProductDir = join(FILE_SYSTEM_ROUTES.PATH_TO_UPLOADS_DIR, user.username, 'products', productId)

		if (!existsSync(pathToProductDir)) throw new NotFoundException('Product directory not found')

		const newSavedFile = await uploadFile(pathToProductDir, file)
		console.log('new saved file: ', newSavedFile)

		const updatedIcons = await this.productsService.pushNewImageToProduct(productId, newSavedFile as string)

		return plainToInstance(ResponseProductDto, updatedIcons)
	}

}
