import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import * as paper from 'paper'
import { PaperOffset } from 'paperjs-offset'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'leafesNg';

  // canvas: HTMLCanvasElement | undefined;
  @ViewChild('myCanvas') canvas: ElementRef | undefined;

  text: string = "Hier könnte ihre \rWerbung stehen";
  textOffsetX = 0;
  textOffsetY = 0;
  fontSize: number = 70;
  font_family = "DIN OT";
  font_weight = "bold";

  color_lines = "#59bd24";
  color_leaf = "#208716";
  color_text = "#000000";
  color_text_shadow = "#ffffff";
  show_text = true;
  show_text_shadow = true;
  text_shadow_width = 10;

  veinCount: number = 0;
  veinIncline: number = 0; // = 30 + Math.floor(Math.random() * 50);
  veinDeform: number = 0; // = 20 + Math.floor(Math.random() * 50);
  trunk_top_deflection: paper.Point = new paper.Point(0,0);

  show_cut_line = true;

  // width = 210;
  // height = 297; 




  canvasWidth: number = 0;
  canvasHeight: number = 0;

  outline: paper.Path | undefined;
  trunk: paper.Path | undefined;

  leafColor: paper.Color | undefined;
  strokeWith = 10;

  top: paper.Point = new paper.Point(0, 0);
  bottom: paper.Point = new paper.Point(0, 0);
  center: paper.Point = new paper.Point(0, 0);

  left_top_deflection: paper.Point = new paper.Point(0, 0);
  left_bottom_deflection: paper.Point = new paper.Point(0, 0);
  right_top_deflection: paper.Point = new paper.Point(0, 0);

  textElement: any;
  textBackground: any;
  leaf: any;


  constructor() { }

  ngOnInit(): void {


  }

  ngAfterViewInit(): void {

    paper.setup(this.canvas?.nativeElement);

    paper.project.view.onFrame = (count: number, time: number, delta: number) => {
      // console.log("frame")
      this.generateLeaf();
    }

    this.setVariables();
    this.generateLeaf();
    this.generateText();
  }

  downloadAsSVG() {

    let fileName = "leaf.svg"

    let options: any = { asString: true };
    let svg: string = paper.project.exportSVG(options) as string;
    let url = "data:image/svg+xml;utf8," + encodeURIComponent(svg);

    let link = document.createElement("a");
    link.download = fileName;
    link.href = url;
    link.click();
  }

  randomPoint(from_x: number, to_x: number, from_y: number, to_y: number): paper.Point {
    let maxPoint = new paper.Point(to_x - from_x, to_y - from_y);
    let randomPoint = paper.Point.random();
    let p = randomPoint.multiply(maxPoint).add(new paper.Point(from_x, from_y));
    return p;
  }

  getTopmost(points: paper.Point[]) {
    let topmost = points[0];

    for (let i = 0; i < points.length; i++) {
      if (points[i].y < topmost.y) {
        topmost = points[i];
      }
    }

    return topmost;
  }

  getBottommost(points: paper.Point[]) {
    let bottommost = points[0];

    for (let i = 0; i < points.length; i++) {
      if (points[i].y > bottommost.y) {
        bottommost = points[i];
      }
    }

    return bottommost;
  }

  setVariables() {

    if (this.canvas == undefined) {
      console.log("canvas not found");
      return;
    }

    // this.canvasHeight = document.documentElement.clientHeight * 0.8; // this.canvas.nativeElement.offsetWidth;
    // this.canvasWidth = (document.documentElement.clientHeight * 0.8) * 0.707070707; // this.canvas.nativeElement.offsetHeight;

    this.canvasWidth = this.canvas.nativeElement.offsetWidth;
    this.canvasHeight = this.canvas.nativeElement.offsetHeight;

    console.log(this.canvasWidth);
    console.log(this.canvasHeight);

    this.outline = new paper.Path();
    this.trunk = new paper.Path();

    // let leafColor = "#b5b5b5";
    this.leafColor = new paper.Color("#208716");
    this.strokeWith = 10;

    this.top = new paper.Point(this.canvasWidth / 2, this.canvasHeight * 0.1);
    this.bottom = new paper.Point(this.canvasWidth / 2, this.canvasHeight - (this.canvasHeight * 0.1));
    this.center = new paper.Point((this.bottom.x + this.top.x) / 2, (this.bottom.y + this.top.y) / 2)


    this.left_top_deflection = this.randomPoint(-300, 0, 50, 150);
    this.left_bottom_deflection = this.randomPoint(-400, -200, 0, -50);
    this.right_top_deflection = this.randomPoint(150, 350, 50, 150);

    this.veinCount = 2 + Math.floor(Math.random() * 3);
    this.veinIncline = 30 + Math.floor(Math.random() * 50);
    this.veinDeform = 20 + Math.floor(Math.random() * 50);

    this.trunk_top_deflection = this.randomPoint(this.left_top_deflection.x, this.right_top_deflection.x, this.left_top_deflection.y, this.right_top_deflection.y);

  }

  updateText(event: any) {
    console.log(event.target.value);
    // this.text = event.target.value;
    this.generateText();
  }

  generateText() {

    if (this.center == undefined) {
      console.log("center is undefined");
      return;
    }

    if (this.textElement) {
      this.textElement.remove();
      this.textBackground.remove();
    }

    if (this.show_text) {
      let offset = new paper.Point(this.textOffsetX, this.textOffsetY);

      if (this.show_text_shadow) {
        this.textBackground = new paper.PointText(this.center.add(offset));
        this.textBackground.justification = 'center';
        this.textBackground.fillColor = new paper.Color(this.color_text);
        this.textBackground.strokeColor = new paper.Color(this.color_text_shadow);
        this.textBackground.strokeWidth = this.text_shadow_width;
        this.textBackground.content = this.text; // 'Yet another \r\nsurvey…?';
        this.textBackground.fontSize = this.fontSize;
        this.textBackground.fontFamily = this.font_family;
        this.textBackground.fontWeight = this.font_weight;
    
        this.textBackground.rotate(90);
      }

      this.textElement = new paper.PointText(this.center.add(offset));
      this.textElement.justification = 'center';
      this.textElement.fillColor = new paper.Color(this.color_text);
      this.textElement.strokeColor = new paper.Color("#e0e0e0");
      this.textElement.strokeWidth = 0;
      this.textElement.content = this.text; // 'Yet another \r\nsurvey…?';
      this.textElement.fontSize = this.fontSize;
      this.textElement.fontFamily = this.font_family;
      this.textElement.fontWeight = this.font_weight;
  
      this.textElement.rotate(90);

      
    }

  }


  generateLeaf() {

    if (this.canvas == undefined) {
      console.log("canvas not found");
      return;
    }

    if (this.leaf != undefined) {
      this.leaf.remove();
    }

    if (
      this.left_top_deflection == undefined ||
      this.left_bottom_deflection == undefined ||
      !this.right_top_deflection == undefined) {
      return;
    }

    let canvasWidth = this.canvas.nativeElement.offsetWidth;
    let canvasHeight = this.canvas.nativeElement.offsetHeight;

    let outline = new paper.Path();
    let trunk = new paper.Path();

    // let leafColor = "#b5b5b5";
    let leafColor = new paper.Color(this.color_lines);
    let strokeWith = 10;

    let top = new paper.Point(canvasWidth / 2, canvasHeight * 0.1);
    let bottom = new paper.Point(canvasWidth / 2, canvasHeight - (canvasHeight * 0.1));

    outline.strokeColor = leafColor;
    outline.strokeWidth = strokeWith;
    outline.fillColor = new paper.Color(this.color_leaf);

    outline.add(top);
    outline.add(bottom);

    outline.closed = true;

    outline.segments[0].handleIn.x = this.right_top_deflection.x;
    outline.segments[0].handleIn.y = this.right_top_deflection.y;
    outline.segments[0].handleOut.x = this.left_top_deflection.x;
    outline.segments[0].handleOut.y = this.left_top_deflection.y;

    outline.segments[1].handleIn.x = this.left_bottom_deflection.x;
    outline.segments[1].handleIn.y = this.left_bottom_deflection.y;
    outline.segments[1].handleOut.x = this.left_bottom_deflection.x * -1;
    outline.segments[1].handleOut.y = this.left_bottom_deflection.y * -1;


    trunk.add(top);
    trunk.add((new paper.Point(0, 50)).add(bottom));
    trunk.strokeColor = leafColor;
    trunk.strokeWidth = strokeWith;


    trunk.segments[0].handleOut.x = this.trunk_top_deflection.x;
    trunk.segments[0].handleOut.y = this.trunk_top_deflection.y;

    trunk.strokeCap = 'round';

    let o = PaperOffset.offsetStroke(trunk, 25, { cap: 'round' })
    o.strokeColor = null; //"rgba(255,0,0,0.3)"
    o.fillColor = null; //"rgba(255,0,0,0.3)"

    let o2 = PaperOffset.offset(outline, 25, { cap: 'round' })
    o2.strokeColor = null; // "rgba(255,0,0,0.3)"
    o2.fillColor = null; //"rgba(255,0,0,0.3)"

    let grp = [];

    if (this.show_cut_line) {
      let leaf = o.unite(o2);
      leaf.strokeColor = new paper.Color("red");
      leaf.strokeWidth = 1;
      grp.push(leaf);
    }


    o.remove();
    o2.remove();


    grp.push(outline);
    grp.push(trunk);
    let group = new paper.Group(grp)

    // group.rotate(60);

    let veinDistance = (bottom.y - top.y) / (this.veinCount + 1);


    let veins: any = [];

    for (let i = 1; i <= this.veinCount; i++) {
      let p = trunk.getPointAt(top.y + (i * veinDistance));
      let p2 = outline.getPointAt((top.y + (i * veinDistance)) - this.veinIncline);

      let vein = new paper.Path();
      vein.add(p);
      vein.add(p2);
      vein.strokeColor = leafColor;
      vein.strokeWidth = strokeWith * 0.7;

      vein.segments[0].handleOut.x = this.veinDeform * -1;
      vein.segments[0].handleOut.y = 0;

      veins.push(vein);
    }

    for (let i = 1; i <= this.veinCount; i++) {
      let p = trunk.getPointAt(top.y + (i * veinDistance) - (veinDistance * 0.4));

      let helper = new paper.Path();
      helper.add(new paper.Point(top.x, (top.y + (i * veinDistance)) - this.veinIncline - (veinDistance * 0.4)));
      helper.add(new paper.Point(canvasWidth, (top.y + (i * veinDistance)) - this.veinIncline - (veinDistance * 0.4)));

      let p2 = outline.getIntersections(helper)[0].point;
      // console.log(p2)
      // let c2 = new paper.Path.Circle(p2, 10);
      // c2.fillColor = "blue";

      helper.remove();

      let vein = new paper.Path();
      vein.add(p);
      vein.add(p2);
      vein.strokeColor = leafColor;
      vein.strokeWidth = strokeWith * 0.7;

      vein.segments[0].handleOut.x = this.veinDeform;
      vein.segments[0].handleOut.y = 0;
      // vein.fullySelected = true;

      veins.push(vein);

    }

    veins = veins.reverse();
    veins.push(group)
    veins = veins.reverse();
    this.leaf = new paper.Group(veins);

    this.generateText();

  }

}
