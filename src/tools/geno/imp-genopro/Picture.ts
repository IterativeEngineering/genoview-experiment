class GenoProPicture {
  data: any;
  
  constructor(data : any) {
    this.data = data;
  }

  getRawData() {
    return this.data;
  }

  getId() {
    return this.data.$.ID;
  }

  get relativePath() {
    return this.data.Path.$.Relative;
  }
}

export default GenoProPicture;
