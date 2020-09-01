import { Injectable } from '@angular/core';
import { MainModelService, Tables, Variant, SettingsService, Business,
         Branch, Product, StockHistory, Labels, PouchDBService, Stock, PouchConfig } from '@enexus/flipper-components';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VariantsDialogModelComponent } from '../variants/variants-dialog-model/variants-dialog-model.component';
import { DialogService,  } from '@enexus/flipper-dialog';
import { StockService } from './stock.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { ViewStockHistoryComponent } from '../view-stock-history/view-stock-history.component';
import { PrintBarcodeLabelsDialogComponent } from '../print-barcode-labels-dialog/print-barcode-labels-dialog.component';
import { DialogSize } from '@enexus/flipper-dialog';


@Injectable({
  providedIn: 'root'
})
export class VariationService {
  hasRegular: Variant = null;
  myAllVariants: Variant[] = [];
  SKU = '';
  d = new Date();
  units: any[] = [];
  form: FormGroup;
  product: Product;
  variantsSubject: BehaviorSubject<Variant[]>;
  defaultBusiness:Business=null;
  private readonly variantsMap = new Map<string, Variant>();
  variant: Variant;
  set allVariants(variants: Variant[]) {
    this.myAllVariants = variants;
  }
  get allVariants(): Variant[] {
      return this.myAllVariants;
  }

  variantStock = { length: 0, currentStock: 0, lowStock: 0 };
  constructor(private stock: StockService, private dialog: DialogService,
              private model: MainModelService,
              private setting: SettingsService,
              private formBuilder: FormBuilder,
              private database: PouchDBService) {
    this.variantsSubject = new BehaviorSubject([]);
    this.units = this.setting.units();
  }

  public loadAllVariants(product: Product): Observable<Variant[]> {
    const data: Variant[] = [];
    // this.allVariant(product).forEach(d => data.push(d as Variant));
    this.variantsSubject.next(data);
    this.variantsMap.clear();
    data.forEach(variant => this.variantsMap.set(variant.id as any, variant));
    return of(data);
  }

  public host(id: string): Variant | undefined {
    return this.variantsMap.get(id);
  }

  init(product: Product): void {

    //TODO: swap the bellow functions regular,createRegular,variants,stockUpdate to use pouch instead of alasql
    if (product) {
      this.product = product;
      this.allVariant(product);
      this.regular(product);
      this.createRegular(product);
      this.variants(product);
      this.stockUpdates();
    }


  }
  activeBusiness(){
    return this.database.currentBusiness().then(business => {
      this.defaultBusiness= business;
   });
  }

  updateDefaultUnit(variation: Variant, key: string, id: string): void {
    this.updateRegularVariant(variation, key, id);


  }

  findVariant(variantId: string) {

    return this.database.query(['table','id'], {
      table: { $eq: 'variants' },
      id: { $eq: variantId }
    }).then(res => {

      if (res.docs && res.docs.length > 0) {
          this.variant= res.docs[0] as Variant;
      } else {
        this.variant= null;
      }
  });

  }

  findFirst(productId: string): Variant {

    return this.database.query(['table','productId'], {
      table: { $eq: 'variants' },
      productId: { $eq: productId }
    }).then(res => {

      if (res.docs && res.docs.length > 0) {
        this.variant= res.docs[0] as Variant;
      } else {
        this.variant= null;
      }
  });
  }

  async request(action = null, variant = null) {
    await this.stock.findVariantStock(variant?variant.id:null);
    const stock: Stock = this.stock.stock?this.stock.stock:null;
    this.form = await this.formBuilder.group({
      name: [!action && variant && variant.name ? variant.name : '', Validators.required],
      SKU: !action && variant && variant.SKU ? variant.SKU : this.generateSKU(),
      retailPrice: [!action && variant && stock ? stock.retailPrice : 0.00, Validators.min(0)],
      supplyPrice: [!action && variant && stock ? stock.supplyPrice : 0.00, Validators.min(0)],
      unit: !action && variant && variant.unit ? variant.unit : '',
      createdAt: new Date(),
      updatedAt: new Date(),

    });
  }

  generateSKU(): string {
    return this.d.getFullYear() + '' + this.makeid(4);
  }

  makeid(length: number) {
    let result           = '';
    const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }

  create(variant: Variant) {
    return  this.database.put(PouchConfig.Tables.variants+'_'+variant.id, variant);
  }

  async createRegular(product: Product) {
    console.log('has regular s',this.hasRegular);
    if (!this.hasRegular) {
      const formData= await {
        id: this.database.uid(),
        name: 'Regular',
        productName: product.name,
        categoryName: '',
        productId: product.id,
        supplyPrice:0.00,
        retailPrice: 0.00,
        unit: this.units.length > 0?this.units[0].value:'',
        SKU: this.generateSKU(),
        syncedOnline: false,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        table:'variants',
      
      };
      await this.database.put(PouchConfig.Tables.variants+'_'+formData.id, formData);
      this.createVariantStock(formData);
      this.regular(product);
    }

  }

  createVariantStock(formData:any) {
    this.stock.createStocks(formData);
  }


 async variants(product: Product) {
    return this.allVariant(product);
  }

 async productStockHistory(product: Product) {
    const variantIds: string[] = [];
    await this.allVariant(product);
     this.allVariants.forEach(sh => {
      variantIds.push(`'${sh.id}'`);
    });
    return this.stock.productStockHistory(variantIds);
  }


  async allVariant(product: Product) {
     
        return this.productVariations(product.id).then(res => {
           
          this.allVariants= res as Variant[];
            
    });
  }
  productVariations(productId){
    return this.database.query(['table', 'productId'], {
      table: { $eq: 'variants' },
      productId: { $eq: productId }
    }).then(res => {
            if (res.docs && res.docs.length > 0) {
              return res.docs as Variant[];
            } else {
              return [];
            }
    });
  }

  
  get formControl() { return this.form.controls; }

  async regular(product: Product) {
   
    return await this.productVariations(product.id).then(res => {
     
     const regular = res.length > 0?res[0]:null; 
      console.log('has regular',regular);
      this.hasRegular =regular;
    }); 
  }



  updateRegularVariant(variation: Variant, key: string, val: any): void {
    if (variation) {
      if (key === 'SKU' && val === '') {
        val = variation.SKU;
      }

      variation[key] = val;
    }
    // variation.productName = this.model.draft<Product>(Tables.products, 'isDraft').name;
    this.update(variation);
  }


  update(variation: Variant): void {
    if (variation) {
      return this.database.put(PouchConfig.Tables.variants+'_'+variation.id, variation);
    }

  }
  async deleteAllVariantsDialog(product: Product) {
    const variants = [];
    await this.allVariant(product);

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

       this.updateStockControl(result, variant);
       this.regular(this.product);
       this.request(null, variant);
       this.variants(this.product);
       this. stockUpdates();
    });
  }

updateStockControl(result: any, variant: Variant) {
  if (result) {
    if (result.length > 0) {
      result.forEach(res => {
        if (res.reason && res.currentStock > 0) {
          this.stock.createHistory({
            id: this.database.uid(),
            orderId: 0,
            variantId: variant.id,
            productId: this.findVariant(variant.id).productId,
            stockId: res.id,
            reason: res.reason,
            quantity: res.currentStock,
            note: res.reason,
            table:'stockHistories',
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
          // update Stock
        const stock = this.stock.findStock(res.id);
        if (res.reason && res.currentStock > 0) {

            if (res.reason === 'Received' || res.reason === 'Restocked') {

              if (!(res.currentStock === 0 || res.currentStock === null)) {
                stock.currentStock = stock.currentStock + res.currentStock;
               }

            } else if (res.reason === 'Re-counted') {

                  if (!(res.currentStock === 0 || res.currentStock === null)) {
                    stock.currentStock = res.currentStock;
                   }
            } else {
              if (!(res.currentStock === 0 || res.currentStock === null)) {
                    stock.currentStock = stock.currentStock - res.currentStock;
              }

            }

          } else {
            res.currentStock = stock.currentStock;
          }

        if (res.currentStock === 0 || res.currentStock === null || res.currentStock === '') {
               stock.currentStock = stock.currentStock;
          }

        stock.canTrackingStock = res.canTrackingStock;
        stock.lowStock = res.lowStock;
        stock.showLowStockAlert = res.showLowStockAlert;


        this.stock.update(stock);

      });
    }
  }
}

  public openStockHistoryDialog(variant: any= null, isArray= false): any {
    return this.dialog.open(ViewStockHistoryComponent, DialogSize.SIZE_LG, {variant, isArray}).subscribe();
  }

  public openPrintBarcodeLablesDialog(): any {
    const labels: Labels[] = [];
    const product  =  this.model.draft<Product>(Tables.products, 'isDraft');
    const allVariants = this.model.filters<Variant>(Tables.variants, 'productId', product.id);
    allVariants.forEach(v => {
      labels.push({name: v.name, sku: v.SKU});
    });
    return this.dialog.open(PrintBarcodeLabelsDialogComponent, DialogSize.SIZE_LG, labels).subscribe();
  }



  async deleteProductVariations(product: Product) {
    if (product) {
      await this.allVariant(product);
      if (this.allVariants.length > 0) {
        this.allVariants.forEach(variation => {
          this.stock.deleteStocks(variation);
          this.stock.deleteStocksHistory(variation);
          this.database.remove(variation);
        });
      }
    }

  }


  deleteVariations(): void {
    const variations: Variant[] = this.allVariants;
    if (variations.length > 0) {
      variations.forEach(variation => {
        this.stock.deleteStocks(variation);
        this.stock.deleteStocksHistory(variation);
        this.database.remove(variation);
      });
    }
  }

  deleteVariation(variant: Variant, product: Product): void {
    if (variant) {
      this.dialog.delete('Variant', [`Variant: ${variant.name}`]).subscribe(confirm => {
        this.stock.deleteStocks(variant);
        this.stock.deleteStocksHistory(variant);
        this.database.remove(variant);
        this.init(product);
      });


    }
  }



  async stockUpdates() {
    if (this.hasRegular) {
      await this.stock.variantStocks(this.hasRegular.id);
      const stock = this.stock.stocks;
      this.variantStock = {
        length: stock.length,
        lowStock: stock.length > 0 ? stock[0].lowStock : 0,
        currentStock: stock.length > 0 ? stock[0].currentStock : 0
      };
    }
  }

  async updateVariant(key: any, variant: Variant, event: any) {
    const val = key === 'unit' ? event.value : event.target.value;

    if (key === 'retailPrice' || key === 'supplyPrice') {
      await this.stock.findVariantStock(variant?variant.id:null);
      const myStock = this.stock.stock;
      myStock[key] = parseInt(val, 10);
      this.stock.update(myStock);
    } else {
      this.updateRegularVariant(variant, key, val);
    }
  } 

  async updateVariantAction(product: Product) {
    await this.allVariant(product);
    if (this.allVariants.length > 0) {
          this.allVariants.forEach(variant => {
            this.stock.updateStockHistoryAction(variant.id);
            variant.isActive = true;
            this.update(variant);
          });
    }
  }

}


