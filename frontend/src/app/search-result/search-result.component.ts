import { environment } from './../../environments/environment'
import { ProductDetailsComponent } from './../product-details/product-details.component'
import { Router, ActivatedRoute } from '@angular/router'
import { ProductService } from './../Services/product.service'
import { BasketService } from './../Services/basket.service'
import { Component, ViewChild, OnDestroy, AfterViewInit, NgZone } from '@angular/core'
import { MatPaginator } from '@angular/material/paginator'
import { Subscription } from 'rxjs'
import { MatTableDataSource } from '@angular/material/table'
import { MatDialog } from '@angular/material/dialog'
import { DomSanitizer } from '@angular/platform-browser'
import fontawesome from '@fortawesome/fontawesome'
import { faEye, faCartPlus } from '@fortawesome/fontawesome-free-solid'
fontawesome.library.add(faEye, faCartPlus)
import * as io from 'socket.io-client'

@Component({
  selector: 'app-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.css']
})
export class SearchResultComponent implements AfterViewInit,OnDestroy {

  public displayedColumns = ['Image', 'Product', 'Description', 'Price', 'Select']
  public tableData: any[]
  public dataSource
  public searchValue
  public io = io
  public socket
  @ViewChild(MatPaginator) paginator: MatPaginator
  private productSubscription: Subscription
  private routerSubscription: Subscription

  constructor (private dialog: MatDialog, private productService: ProductService,private basketService: BasketService, private router: Router, private route: ActivatedRoute, private sanitizer: DomSanitizer, private ngZone: NgZone) { }

  ngAfterViewInit () {

    this.ngZone.runOutsideAngular(() => {
      this.socket = this.io.connect(environment.hostServer)
    })

    this.productSubscription = this.productService.search('').subscribe((tableData: any) => {
      this.tableData = tableData
      this.trustProductDescription(this.tableData)
      this.dataSource = new MatTableDataSource<Element>(this.tableData)
      this.dataSource.paginator = this.paginator
      this.filterTable()
      this.routerSubscription = this.router.events.subscribe(() => {
        this.filterTable()
      })
    }, (err) => console.log(err))
  }

  ngOnDestroy () {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe()
    }
    if (this.productSubscription) {
      this.productSubscription.unsubscribe()
    }
  }

  filterTable () {
    let queryParam: string = this.route.snapshot.queryParams.q
    if (queryParam && queryParam.includes('<iframe src="javascript:alert(\'xss\')">')) {
      this.socket.emit('localXSSChallengeSolved', queryParam)
    }
    if (queryParam) {
      queryParam = queryParam.trim()
      queryParam = queryParam.toLowerCase()
      this.dataSource.filter = queryParam
      this.searchValue = this.sanitizer.bypassSecurityTrustHtml(queryParam)
    } else {
      this.dataSource.filter = ''
      this.searchValue = undefined
    }
  }

  showDetail (element: any) {
    this.dialog.open(ProductDetailsComponent, {
      width: '1000px',
      height: 'max-content',
      data: {
        productData: element
      }
    })
  }

  addToBasket (id: number) {
    this.basketService.find(sessionStorage.getItem('bid')).subscribe((basket) => {
      let productsInBasket: any = basket.Products
      let found = false
      for (let i = 0; i < productsInBasket.length; i++) {
        if (productsInBasket[i].id === id) {
          found = true
          this.basketService.get(productsInBasket[i].BasketItem.id).subscribe((existingBasketItem) => {
            let newQuantity = existingBasketItem.quantity + 1
            this.basketService.put(existingBasketItem.id, { quantity: newQuantity }).subscribe(() => {
              /* Translations to be added when i18n is set up */
            })
          })
          break
        }
      }
      if (!found) {
        this.basketService.save({ ProductId: id, BasketId: sessionStorage.bid, quantity: 1 }).subscribe((newBasketItem) => {
          /* Translations to be added when i18n is set up */
        })
      }
    })
  }

  trustProductDescription (tableData: any[]) {
    for (let i = 0; i < tableData.length; i++) {
      tableData[i].description = this.sanitizer.bypassSecurityTrustHtml(tableData[i].description)
    }
  }

  isLoggedIn () {
    return localStorage.getItem('token')
  }

}
