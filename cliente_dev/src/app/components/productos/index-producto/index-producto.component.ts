import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ClienteService } from 'src/app/services/cliente.service';
import { GLOBAL } from 'src/app/services/GLOBAL';
declare var iziToast : any;
import { io } from "socket.io-client";


declare var $: any;
declare var noUiSlider : any ;

@Component({
  selector: 'app-index-producto',
  templateUrl: './index-producto.component.html',
  styleUrls: ['./index-producto.component.css']
})
export class IndexProductoComponent implements OnInit {
  public config_global : any = {};
  public filter_categoria ='';
  public productos : Array<any> =[];
  public filter_producto ='';
  public filter_cat_productos = 'todos';
  public url : any;

  public load_data = true;

  public route_categoria : any;
  public page = 1;
  public pageSize = 15;
  public token : any;
  
  public sort_by = 'Defecto';
  public carrito_data : any ={
    variedad : '',
    cantidad : 1
  };

  public btn_cart = false;
  public socket = io('https://api.dimport.online');
  
  constructor(private _clienteService: ClienteService, private _route: ActivatedRoute) { 
    this.token = localStorage.getItem('token');
    this.url = GLOBAL.url;
    this._clienteService.obtener_publico().subscribe(
      response=>{
        this.config_global = response.data;
      }
    );

    this._route.params.subscribe(
      params=>{
        this.route_categoria = params['categoria'];
        console.log(this.route_categoria);


        if(this.route_categoria){
          this._clienteService.listar_producto_publico('').subscribe(
            response=>{
              this.productos = response.data;
              this.productos = this.productos.filter(item=> item.categoria.toLowerCase().replace(/\s+/g, "") == this.route_categoria.replace(/\s+/g, ""));
              this.load_data = false;
            }
          );
        }else {
          this._clienteService.listar_producto_publico('').subscribe(
            response=>{     
              this.productos = response.data;
              this.load_data = false;
            }
          );
        }

      }
    ); 
  }

  ngOnInit(): void {

    var slider : any = document.getElementById('slider');
    noUiSlider.create(slider, {
        start: [0, 1000],
        connect: true,
        decimals: false,
        range: {
            'min': 0,
            'max': 1000
        },
        tooltips: [true,true],
        pips: {
          mode: 'count', 
          values: 5,
          
        }
    })

    slider.noUiSlider.on('update', function (values: any) {
     
        $('.cs-range-slider-value-min').val(values[0]);
        $('.cs-range-slider-value-max').val(values[1]);
    });
    $('.noUi-tooltip').css('font-size','11px');

  }

  buscar_categorias( ){
    if(this.filter_categoria){
      var search = new RegExp(this.filter_categoria, 'i');
      this.config_global.categorias = this.config_global.categorias.filter(
        (item : any) => search.test(item.titulo)
      );
    }else{
      this._clienteService.obtener_publico().subscribe(
        response=>{
          this.config_global = response.data;
        }
      )

    }
  }

  buscar_producto(){
    this._clienteService.listar_producto_publico(this.filter_producto).subscribe(
      response=>{
        this.productos = response.data;
        this.load_data = false;
      },
      error => {
        iziToast.show({
          backgroundColor: '#dc3424',
          class: 'text-danger',
          position: 'topRight',
          message: 'Ocurrio un error en el servidor',
          messageColor: '#FFFFFF',
          progressBarColor: '#FFFFFF'
        });
    });
    
  }

  buscar_precios(){

    this._clienteService.listar_producto_publico(this.filter_producto).subscribe(
      response=>{
       
        this.productos = response.data;

        let min =  parseInt($('.cs-range-slider-value-min').val());
        let max =  parseInt($('.cs-range-slider-value-max').val());
        
        console.log(min);
        console.log(max);

        this.productos = this.productos.filter((item)=>{
          return item.precio >= min &&
          item.precio <= max
     });
      }
    );

    
  }

  buscar_por_categoria(){
    if(this.filter_cat_productos == 'todos'){
      this._clienteService.listar_producto_publico(this.filter_producto).subscribe(
        response=>{ 
          this.productos = response.data;
          this.load_data = false;
        }
      );
    }else {
      this._clienteService.listar_producto_publico(this.filter_producto).subscribe(
        response=>{
         
          this.productos = response.data;
          this.productos = this.productos.filter(item=> item.categoria == this.filter_cat_productos);
          this.load_data = false;
        }
      );
      
    }
  }
  
  reset_productos(){
    this._clienteService.listar_producto_publico('').subscribe(
      response=>{
        this.filter_producto = '';
        this.productos = response.data;
        this.load_data = false;
      }
    );
  }

  orden_por(){
    if(this.sort_by == 'Defecto'){
      this._clienteService.listar_producto_publico('').subscribe(
        response=>{
          this.productos = response.data;
          this.load_data = false;
        }
      );
    }else if(this.sort_by == 'Popularidad'){
      this.productos.sort(function  (a, b){

        if(a.nventas < b.nventas){
          return 1;
        }
        if(a.nventas > b.nventas){
          return -1;
        }
        return 0;

      });
    }else if(this.sort_by == '+-Precio'){
      this.productos.sort(function  (a, b){

        if(a.precio < b.precio){
          return 1;
        }
        if(a.precio > b.precio){
          return -1;
        }
        return 0;

      });
    }else if(this.sort_by == '-+Precio'){
      this.productos.sort(function  (a, b){

        if(a.precio > b.precio){
          return 1;
        }
        if(a.precio < b.precio){
          return -1;
        }
        return 0;

      });
    }else if(this.sort_by == 'azTitulo'){
      this.productos.sort(function  (a, b){

        if(a.titulo > b.titulo){
          return 1;
        }
        if(a.titulo < b.titulo){
          return -1;
        }
        return 0;

      });
    }else if(this.sort_by == 'zaTitulo'){
      this.productos.sort(function  (a, b){

        if(a.titulo < b.titulo){
          return 1;
        }
        if(a.titulo > b.titulo){
          return -1;
        }
        return 0;

      });
    }
  }

  agregar_producto(producto : any){
    let variedad = null;
    if(producto.variedades.lenght > 0){
      variedad = producto.variedades[0].titulo
    }
    let data = {
      producto: producto._id,
      cliente: localStorage.getItem('_id'),
      cantidad: 1,
      variedad: variedad
    }
    this.btn_cart = true;

    this._clienteService.agregar_carrito_cliente(data,this.token).subscribe(
      response =>{
        if(response.data == undefined){
          iziToast.show({
            title: 'ERROR',
            titleColor: '#FF0000',
            class: 'text-danger',
            position: 'topRight',
            message: 'El producto ya existe en el carrito'
          });
          this.btn_cart = false;
        }else{
          console.log(response);
          iziToast.show({
          title: 'SUCCESS',
          titleColor: '#1DC74C',
          color: '#FFF',
          class: 'text-seccess',
          position: 'topRight',
          message: 'Se agrego el producto al carrito' 
        });
        this.socket.emit('add-carrito-add',{data:true});
        this.btn_cart = false;
        }
        
      }
    );
  }

  categorias_length(categoria: any): number {
    let count = 0;
    /* this._clienteService.listar_producto_publico('').subscribe(
      response=>{     
        response.data.forEach((product : any) => {
          if(product.categoria.toLowerCase().replace(/\s+/g, "") == categoria.toLowerCase().replace(/\s+/g, "")){
            count++;
          }
        });
      }
    ); */
    return count;
  }
}

