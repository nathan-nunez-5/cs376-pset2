// class PageState{
// 	constructor()
// }
let server = 'https://localhost:3000'

//make sure state handles well/better
let reqsPerQ = 10
let currentObjectList = null
let currentArtObject = null
let currentExImageObject = null
let detailsWanted = ['title', 'accessionyear', 'dated', 'datebegin', 'labeltext', 'dateend', 'classification', 'medium', 'technique', 'period', 'century', 'culture', 'dimensions', 'creditline', 'department', 'division']

class ImageObject{
	constructor(imageid, height, width, format, baseimageurl, iiifbaseuri){
		this.imageid = imageid
		this.height = height
		this.width = width
		this.format = format
		this.baseurl = baseimageurl
		this.iiifuri = iiifbaseuri
		this.dh = 150 //default height
		this.dw = 150 //defualt width
	}

	displayImgHTML(expandable){
		let imgurl = this.baseurl + '?height=' + 150 + '&width=' + 150
		if(expandable === undefined){
			return  '<img src="' + imgurl + '">'
		}else{
			return  '<div id="image-'+ this.imageid +'" onclick=expandImageW(' + this.imageid +')> <img src="' + imgurl + '"> </div>'
			//return  '<img id="image-'+ this.imageid +'" src="' + imgurl + '" onclick=expandImageW()>'
		}
	}

	expandImg(){
		document.getElementById('full-size-image').innerHTML = '<img onclick="hideFullSizeImage()" src="' + this.baseurl + '">'
		currentExImageObject = null
	}
}

//<div class="image-container" onclick="expandAOImage">

class ArtObject{
  constructor(id, name, deets, imgObject, imgList){
		this.id = id
    this.name = name
		this.details = deets
		this.showingContents = false
    this.defimg = imgObject
		this.images = imgList
  }

	display(){
		let imgHTML = '<div class="content-image" >' + ((this.defimg == null) ? 'there is no image available :(' : this.defimg.displayImgHTML()) + '</div>'
		return '<div class="content-result" id="object-'+ this.id +'" onclick="showAODetails(' + this.id + ')">' + imgHTML + '<br>' + this.name + " </div>"

	}

	redisplay(){
		let imgHTML = '<div class="content-image" >' + ((this.defimg == null) ? 'there is no image available :(' : this.defimg.displayImgHTML()) + '</div>'
		document.getElementById('object-'+this.id).innerHTML = imgHTML + '<br>' + this.name
	}

	showDetails(){
		let imagesHTML = '';
		if(this.images != null || this.images.length > 0){
			imagesHTML = displayIOListHTML(this.images)
		}else{
			imagesHTML = 'there is no image available :( <br>'
		}
		let detailHTML = ''
		this.details.forEach((detail) => {detailHTML += detail + '<br>'})
		document.getElementById('object-'+this.id).innerHTML = imagesHTML + '<br>' +detailHTML
	}
}

function hideFullSizeImage(){
	document.getElementById('full-size-image').innerHTML = ''
}

function expandImageW(imageid){
	let currentIO = currentArtObject.images.find((io) => { return io.imageid == imageid })
	currentIO.expandImg()
}

function displayIOListHTML(ioList){
	let outHTML = ''
	for(let i = 0; i < ioList.length; i++){
		outHTML += ioList[i].displayImgHTML(true)
	}
	return outHTML
}

function showAODetails(id){

	if(currentObjectList == null){
		console.log('no object list')
	}
	let currentAO = currentObjectList.find((ao) => { return ao.id == id })
	currentArtObject = currentAO
	if(this.showingContents){
		currentAO.redisplay()
		this.showingContents = false
	}else{
		currentAO.showDetails()
		this.showingContents = true
	}
}

function showGalleryList() {
  document.getElementById("gallery-dropdown").classList.toggle("show");
}

//code from https://www.w3schools.com/howto/tryit.asp?filename=tryhow_css_js_dropdown
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {
    let dropdowns = document.getElementsByClassName("dropdown-content");
    let i;
    for (i = 0; i < dropdowns.length; i++) {
      let openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}

async function showGalleryContents(id){
  let galleryUrl = buildURL({}, 'gallery/' +id) //url to get gallery
	let response = await fetch(galleryUrl)
  let data = await response.json()
	let name = data.name + ((data.theme != null) ? (': ' + data.theme) : '')
	document.getElementById('content-title').innerHTML = '<h2> '+ name + '</h2>'

  let golUrl = buildURL({gallery: id}, 'object/'); //url to get objects in gallery
  response = await fetch(golUrl)
  data = await response.json()
  //console.log(data2)
	let objList = []
	let pages = data.info.pages
  if (pages < 1){//no objects render
		document.getElementById('content-list').innerHTML = '<h1 class="header"> No objects found in this gallery. </h1>'
  }else{
		let count = 1;
		for(let i = 1; i <= pages; i++){
			let pageiURL = buildURL({gallery: id, page: i}, 'object/')
	    response = await fetch(pageiURL)
	    let pageData = await response.json()
			let recordSize = pageData.records.length
			//console.log(pageData)
			for (let i = 0; i < recordSize; i++, count++) {
				let objId = pageData.records[i].id
				let objUrl = buildURL({}, 'object/'+objId)
				response = await fetch(objUrl)
				data = await response.json()
				objList.push(buildObject(data))
			}
		}
  }
	//sort here
	document.getElementById('content-list').innerHTML = "";
	objList.forEach(function(obj){
    document.getElementById('content-list').innerHTML += obj.display()
  })
	currentObjectList = objList
}


function buildURL(params, resourceType){
  let base = server + '/' + resourceType
  let url = new URL(base)
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
  //url.searchParams.append('apikey', apikey)
  return url
}

async function getGalleryList(res){
  let galleryList = []
  let url = buildURL({}, 'gallery')
  let response = await fetch(url)
  let data = await response.json()
  //console.log(data)
  let pages = data.info.pages
  //console.log(pages)
  for (let i = 1; i <= pages; i++) {
    let pageiURL = buildURL({page: i}, 'gallery')
    response = await fetch(pageiURL)
    data = await response.json()
    let recordSize = data.records.length
    //console.log(recordSize)
    for (let j = 0; j < recordSize; j++) {
      //console.log(data.records[j].name, data.records[j].theme, data.records[j].id)
      let fullname = data.records[j].name + ((data.records[j].theme != null) ? (': ' + data.records[j].theme) : '')
      galleryList.push(
      { name: fullname,
        id: data.records[j].id
      })
    }
  }
	galleryList.sort((a,b) => {	return a.name > b.name })
  galleryList.forEach(function(gallery){
    document.getElementById('gallery-dropdown').innerHTML += '<a onclick="showGalleryContents('+ gallery.id + ')">' + gallery.name + '</a>'
  })
}

function buildImage(ie){//imageElement
	let io = new ImageObject(ie.imageid, ie.height, ie.width, ie.format, ie.baseimageurl, ie.iiifbaseuri) //ImageObject
	return io
}


function buildObject(data){
	let io = (data.images.length < 1) ? null : buildImage(data.images[0])
	let detailList = []
	Object.keys(data).forEach(key => { if(data[key] != null && detailsWanted.includes(key)){	detailList.push(key + ': ' + data[key]) } })
	let ioList = []
	data.images.forEach(imageData => {ioList.push(buildImage(imageData))})
	let ao = new ArtObject(data.id, data.title, detailList, io, ioList)
	return ao
}
