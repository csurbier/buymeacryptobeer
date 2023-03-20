import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Exhib.fans';

   constructor( 
    public router:Router){

    console.log("window location href ",window.location.href)
    console.log("Router ",this.router.url); 
    let origin 
    if (window.location.href.includes("https")){
      origin = window.location.href.split("https://")
    }
    else{
      origin = window.location.href.split("http://")
    }
    // let href=origin[1]
    // console.log(href)
    // if (href.includes("/dapp")){
    //   //TODO : check si nft et deja authentifie
    //  // this.router.navigateByUrl("/dapp")
    // }
    // else{
    //   let tokens = href.split(".")
    //   let clubName = tokens[0]
    //   console.log(clubName)
    // }
   
  }
  
  ngOnInit() {
    this.loadScript('../assets/js/vendor/jquery.js');
    this.loadScript('../assets/js/vendor/jquery.nice-select.min.js');
    this.loadScript('../assets/js/vendor/jquery-ui.js');
    this.loadScript('../assets/js/vendor/modernizer.min.js');
    this.loadScript('../assets/js/vendor/feather.min.js');
    this.loadScript('../assets/js/vendor/slick.min.js');
    this.loadScript('../assets/js/vendor/bootstrap.min.js');
    this.loadScript('../assets/js/vendor/sal.min.js');
    this.loadScript('../assets/js/vendor/waypoint.js');
    this.loadScript('../assets/js/vendor/wow.js');
    this.loadScript('../assets/js/vendor/particles.js');
    this.loadScript('../assets/js/vendor/jquery.style.swicher.js');
    this.loadScript('../assets/js/vendor/js.cookie.js');
    this.loadScript('../assets/js/vendor/count-down.js');
    this.loadScript('../assets/js/vendor/counter-up.js');
    this.loadScript('../assets/js/vendor/isotop.js');
    this.loadScript('../assets/js/vendor/imageloaded.js');
    this.loadScript('../assets/js/vendor/backtoTop.js');
    this.loadScript('../assets/js/vendor/scrolltrigger.js');
    this.loadScript('../assets/js/vendor/jquery.custom-file-input.js');
    this.loadScript('../assets/js/main.js');
    
  }
 
 public loadScript(url: string) {
   const body = <HTMLDivElement> document.body;
   const script = document.createElement('script');
   script.innerHTML = '';
   script.src = url;
   script.async = false;
   script.defer = true;
   body.appendChild(script);
 }
}
   