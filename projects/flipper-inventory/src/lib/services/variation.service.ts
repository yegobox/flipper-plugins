import { Injectable } from '@angular/core';
import { MainModelService, Tables, Variant, SettingsService, Business,
         Branch, Product, Stock, StockHistory } from '@enexus/flipper-components';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VariantsDialogModelComponent } from '../variants/variants-dialog-model/variants-dialog-model.component';
import { DialogService, DialogSize } from '@enexus/flipper-dialog';
import { StockService } from './stock.service';
import { AddVariantComponent } from '../variants/add-variant/add-variant.component';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { ViewStockHistoryComponent } from '../view-stock-history/view-stock-history.component';
@Injectable({
  providedIn: 'root'
})
export class VariationService {
  hasRegular: Variant = null;
  allVariants: Variant[] = [];
  SKU = '';
  d = new Date();
  units: any[] = [];
  form: FormGroup;
  product: Product;
  variantsSubject: BehaviorSubject<Variant[]>;
  private readonly variantsMap = new Map<string, Variant>();

  variantStock = { length: 0, currentStock: 0, lowStock: 0 };
  constructor(private stock: StockService, private dialog: DialogService,
              private model: MainModelService, private setting: SettingsService,
              private formBuilder: FormBuilder) {
    this.variantsSubject = new BehaviorSubject([]);
  }

  public loadAllVariants(product: Product): Observable<Variant[]> {
    const data: Variant[] = [];
    this.allVariant(product).forEach(d => data.push(d as Variant));
    this.variantsSubject.next(data);
    this.variantsMap.clear();
    data.forEach(variant => this.variantsMap.set(variant.id as any, variant));
    return of(data);
  }

  public host(id: string): Variant | undefined {
    return this.variantsMap.get(id);
  }

  init(product: Product): void {
    this.units = this.setting.units();
    if (product) {
      this.product = product;
      this.regular(product);
      this.createRegular(product);
      this.variants(product);
      this.stockUpdates();
    }


  }

  public activeBusiness(): Business {
    return this.model.active<Business>(Tables.business);
  }
  updateDefaultUnit(variation: Variant, key: string, id: number): void {
    this.updateRegularVariant(variation, key, id);


  }

  findFirst(productId: number): Variant {
    return this.model.findByFirst<Variant>(Tables.variants, 'productId', productId);
  }

  request(action = null, variant = null): void {
    this.form = this.formBuilder.group({
      name: [!action && variant && variant.name ? variant.name : '', Validators.required],
      SKU: !action && variant && variant.SKU ? variant.SKU : this.generateSKU(),
      retailPrice: !action && variant && this.stock.findStock(variant.id).retailPrice ? this.stock.findStock(variant.id).retailPrice : 0.00,
      supplyPrice: !action && variant && this.stock.findStock(variant.id).supplyPrice ? this.stock.findStock(variant.id).supplyPrice : 0.00,
      unit: !action && variant && variant.unit ? variant.unit : '',
      createdAt: new Date(),
      updatedAt: new Date(),

    });
  }

  generateSKU(): string {
    return this.d.getSeconds() + this.d.getHours() + this.d.getDay() + '' + ''
     + this.d.getDate() + '' + this.d.getMonth() + '' + this.d.getFullYear();
  }

  create(variant: Variant): Variant | Variant[] {
    return this.model.create<Variant>(Tables.variants, variant);
  }

  createRegular(product: Product): void {
    if (!this.hasRegular) {
      this.create({
        name: 'Regular',
        productName: product.name,
        SKU: this.generateSKU(),
        productId: product.id,
        supplyPrice: 0,
        retailPrice: 0,
        wholeSalePrice: 0,
        unit: '',
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      this.regular(product);

      if (this.units.length > 0) {
        this.updateDefaultUnit(this.hasRegular, 'unit', this.units[0].value);
      }


      if (this.hasRegular) {
        this.createVariantStock(this.hasRegular.id);
      }


    }
  }

  createVariantStock(variantId: number) {
    this.stock.createStocks(variantId,
      this.model.filters<Branch>(Tables.branch, 'businessId',
        this.model.active<Business>(Tables.business).id)
    );
  }


  variants(product: Product): void {
    this.allVariants = this.model.filters<Variant>(Tables.variants, 'productId', product.id);
  }

  productStockHistory(product: Product): StockHistory[] {
    const variantIds: number[] = [];
    this.allVariant(product).forEach(sh => {
      variantIds.push(sh.id);
    });
    return this.stock.productStockHistory(variantIds);
  }


  allVariant(product: Product): Variant[] {
    return this.model.filters<Variant>(Tables.variants, 'productId', product.id);
  }
  get formControl() { return this.form.controls; }

  regular(product: Product): void {

    this.hasRegular = this.model.findByLast<Variant>(Tables.variants, 'productId', product.id);
  }



  updateRegularVariant(variation: Variant, key: string, val: any): void {
    if (variation) {
      if (key === 'SKU' && val === '') {
        val = variation.SKU;
      }

      variation[key] = val;
    }
    variation.productName = this.model.draft<Product>(Tables.products, 'isDraft').name;
    this.update(variation);
  }


  update(variation: Variant): void {
    if (variation) {
      this.model.update<Variant>(Tables.variants, variation, variation.id);
    }

  }
  deleteAllVariantsDialog(product: Product) {
    const variants = [];
    this.allVariants.forEach((v, i) => {
      variants.push(`${i + 1}. ${v.name}`);
    });
    this.dialog.delete('Variants', variants).subscribe(confirm => {
      this.deleteProductVariations(product);
      this.init(product);
    });
  }

  public openVariantDialog(variant: Variant, selectedIndex: number): any {
    return this.dialog.open(VariantsDialogModelComponent, DialogSize.SIZE_MD, { variant, selectedIndex }).subscribe(result => {
      this.regular(this.product);
      this.request(null, variant);
      this.stockUpdates();
    });
  }


  public openStockHistoryDialog(variant: any= null, isArray= false): any {
    return this.dialog.open(ViewStockHistoryComponent, DialogSize.SIZE_LG, {variant, isArray}).subscribe();
  }

  public openAddVariantDialog(product: Product): any {
    return this.dialog.open(AddVariantComponent, DialogSize.SIZE_MD, product).subscribe(result => {
      if (result === 'done') {
        this.variants(product);
      }

    });
  }

  deleteProductVariations(product: Product): void {
    if (product) {

      const variations: Variant[] = this.model.filters<Variant>(Tables.variants, 'productId', product.id);
      if (variations.length > 0) {
        variations.forEach(variation => {
          this.stock.deleteStocks(variation);
          this.stock.deleteStocksHistory(variation);
          this.model.delete(Tables.variants, variation.id);
        });
      }
    }

  }


  deleteVariations(): void {
    const variations: Variant[] = this.model.loadAll<Variant>(Tables.variants);
    if (variations.length > 0) {
      variations.forEach(variation => {
        this.stock.deleteStocks(variation);
        this.stock.deleteStocksHistory(variation);
        this.model.delete(Tables.variants, variation.id);
      });
    }
  }

  deleteVariation(variant: Variant): void {
    if (variant) {
      this.dialog.delete('Variant', [`Variant: ${variant.name}`]).subscribe(confirm => {
        this.stock.deleteStocks(variant);
        this.stock.deleteStocksHistory(variant);
        this.model.delete(Tables.variants, variant.id);
      });


    }
  }



  stockUpdates(): void {
    if (this.hasRegular) {
      const stock = this.stock.variantStocks(this.hasRegular.id);
      this.variantStock = {
        length: stock.length,
        lowStock: stock[0].lowStock,
        currentStock: stock[0].currentStock
      };
    }
  }

  updateVariant(key: any, variant: Variant, event: any) {
    const val = key === 'unit' ? event.value : event.target.value;

    if (key === 'retailPrice' || key === 'supplyPrice') {
      const myStock = this.stock.findStock(variant.id);
      myStock[key] = parseInt(val, 10);
      this.stock.update(myStock);
    } else {
      this.updateRegularVariant(variant, key, val);
    }
  }

  updateVariantAction(product: Product) {
    const variants: Variant[] = this.model.filters<Variant>(Tables.variants, 'productId', product.id);
    if (variants.length > 0) {
      variants.forEach(variant => {
        this.stock.updateStockHistoryAction(variant.id);
        variant.productName = product.name;
        variant.isActive = true;
        this.update(variant);
      });
    }
  }

}


