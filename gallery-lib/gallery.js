const GalleryClassName = 'gallery';
const GalleryLineClassName = 'gallery-line';
const GalleryDraggableClassName = 'gallery-draggable';
const GallerySlideClassName = 'gallery-slide';

class Gallery {
  constructor(element, options = {}){
    this.containerNode = element;
    this.size = element.childElementCount;
    this.currentSlide = 0;
    this.currentSlideWasChange = false;
    this.settings = {
      margin: options.margin || 0,
    }

    this.manageHTML = this.manageHTML.bind(this);
    this.setParameters = this.setParameters.bind(this);
    this.setEvents = this.setEvents.bind(this);
    this.resizeGallery = this.resizeGallery.bind(this);
    this.startDrag = this.startDrag.bind(this);
    this.stopDrag = this.stopDrag.bind(this);
    this.dragging = this.dragging.bind(this);
    this.setStylePosition = this.setStylePosition.bind(this);
    this.setStyleTransition = this.setStyleTransition.bind(this);

    this.manageHTML();
    this.setParameters();
    this.setEvents();
  }

  manageHTML() {
    this.containerNode.classList.add(GalleryClassName);
    this.containerNode.innerHTML = `
      <div class="${GalleryLineClassName}">
        ${this.containerNode.innerHTML}
      </div>
    `;

    this.lineNode = this.containerNode.querySelector(`.${GalleryLineClassName}`);

    this.slideNodes = Array.from(this.lineNode.children).map((childNode) =>
      wrapElementByDiv({
        element: childNode,
        className: GallerySlideClassName,
      })
    );
  }

  setParameters() {
    const coordsContainer = this.containerNode.getBoundingClientRect();
    this.width = coordsContainer.width;
    this.maximum = - (this.size - 1) * (this.width + this.settings.margin);
    this.x = -this.currentSlide * (this.width + this.settings.margin);

    this.resetStyleTransition()
    this.lineNode.style.width = `${this.size * (this.width + this.settings.margin)}px`;
    this.setStylePosition;
    Array.from(this.slideNodes).forEach((slideNode) => {
      slideNode.style.width = `${this.width}px`;
      slideNode.style.marginRight = `${this.settings.margin}px`;
    });
  }

  setEvents() {
    this.debouncedResizeGallery = debounce(this.resizeGallery);
    window.addEventListener('resize', this.debouncedResizeGallery);
    
    this.lineNode.addEventListener('pointerdown', this.startDrag);
    window.addEventListener('pointerup', this.stopDrag);
    window.addEventListener('pointercancel', this.stopDrag);
  }

  destroyEvents(){
    window.removeEventListener('resize', this.debouncedResizeGallery);
    this.lineNode.removeEventListener('pointerdown', this.startDrag);
    window.removeEventListener('pointerup', this.stopDrag);
    window.removeEventListener('pointercancel', this.stopDrag);
  }

  resizeGallery() {
    this.setParameters();
  }

  startDrag(evt) {
    this.currentSlideWasChange = false;
    this.clickX = evt.pageX;
    this.startX = this.x;

    this.resetStyleTransition();

    this.containerNode.classList.add(GalleryDraggableClassName);
    window.addEventListener('pointermove', this.dragging);
  }

  stopDrag() {
    window.removeEventListener('pointermove', this.dragging);

    this.containerNode.classList.remove(GalleryDraggableClassName);

    this.x = -this.currentSlide * (this.width + this.settings.margin);

    this.setStylePosition();
    this.setStyleTransition();

  }

  dragging(evt) {
    this.dragX = evt.pageX;
    const dragShift = this.dragX - this.clickX;
    const easing = dragShift / 5;
    this.x = Math.max(Math.min(this.startX + dragShift, easing), this.maximum + easing);

    this.resetStyleTransition();
    this.setStylePosition()

    if(
      dragShift > 20 &&
      dragShift > 0 &&
      !this.currentSlideWasChange &&
      this.currentSlide > 0
    ) {
      this.currentSlideWasChange = true;
      this.currentSlide = this.currentSlide - 1;
    }

    if(
      dragShift < -20 &&
      dragShift < 0 &&
      !this.currentSlideWasChange &&
      this.currentSlide < this.size - 1
    ) {
      this.currentSlideWasChange = true;
      this.currentSlide = this.currentSlide + 1;
    }
  }

  setStylePosition() {
    this.lineNode.style.transform = `translate3d(${this.x}px, 0, 0)`;
  }

  setStyleTransition() {
    this.lineNode.style.transition = `all 0.25s ease 0s`;
  }

  resetStyleTransition() {
    this.lineNode.style.transition = `all 0s ease 0s`;
  }
}

function wrapElementByDiv({element, className}) {
  const wrapperNode = document.createElement('div');
  wrapperNode.classList.add(className);

  element.before(wrapperNode);
  wrapperNode.append(element);

  return wrapperNode;
};

function debounce(func, time = 100) {
  let timer;
  return function(event){
    clearTimeout(timer);
    timer = setTimeout(func, time, event);
  }
}