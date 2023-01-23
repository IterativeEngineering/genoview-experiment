import xml2js from 'xml2js';
import moment from 'moment';

import Picture from './Picture';
import Individual from './Individual';

class GenoProFile {

  xmlData: any = undefined;
  fileName: string = '';

  individualsArray: Array<Individual> = [];
  picturesArray: Array<Picture> = [];

  picturesDictionary: Map<string, Picture> = new Map();
  occupationsDictionary: Map<string, any> = new Map();
  placesDictionary: Map<string, any> = new Map();
  sourcesDictionary: Map<string, any> = new Map();

  pedigreeLinks: any = {};

  // LOAD

  async loadXmlFromUrl(url: string) {
    this.fileName = url || 'Data.xml';

    const response = await fetch(this.fileName, {
      method: 'get',
    });

    const rawData = await response.text();
    this.loadXml(rawData);

    return this.getXmlData();
  }

  loadXml(rawData : string) {
    new xml2js.Parser({ explicitArray: false })
      .parseString(rawData, (err : Error | null, parsedData : any) => {
        this.buildModel(parsedData);
      });
  }

  buildModel(xmlData : any) {
    this.xmlData = xmlData;

    this.individualsArray = this.xmlData.GenoPro.Individuals.Individual.map((node : any) => {
      return new Individual(node, this);
    });

    this.pedigreeLinks = xmlData.GenoPro.PedigreeLinks.PedigreeLink;

    if (xmlData.GenoPro.Pictures) {
      this.picturesArray = xmlData.GenoPro.Pictures.Picture.forEach((node : any) => {
        const picture = new Picture(node);
        this.picturesDictionary.set(picture.getId(), picture);
        return picture;
      });
    }

    if (xmlData.GenoPro.Occupations) {
      this.occupationsDictionary = this.buildDictionary(xmlData.GenoPro.Occupations.Occupation);
    }

    if (xmlData.GenoPro.Places) {
      this.placesDictionary = this.buildDictionary(xmlData.GenoPro.Places.Place);
    }

    if (xmlData.GenoPro.SourcesAndCitations) {
      this.sourcesDictionary = this.buildDictionary(xmlData.GenoPro.SourcesAndCitations.SourceCitation);
    }
  }

  buildDictionary(nodes : Array<any>) {
    const dict = new Map<string, any>();
    nodes.forEach((node) => {
      dict.set(node.$.ID, node);
    });
    return dict;
  }

  // GETTERS

  getXmlData() {
    return this.xmlData;
  }

  getFileName() {
    return this.fileName;
  }

  getIndividuals() {
    return this.individualsArray;
  }

  getPictures() {
    return this.picturesArray;
  }

  getPicture(id : string) {
    return this.picturesDictionary.get(id);
  }

  getPedigreeLinks() {
    return this.pedigreeLinks;
  }

  getPlacesDictionary() {
    return this.placesDictionary;
  }

  getPicturesDictionary() {
    return this.picturesDictionary;
  }

  getSourcesDictionary() {
    return this.sourcesDictionary;
  }

  getOccupationsDictionary() {
    return this.occupationsDictionary;
  }

  getOccupation(id : string) {
    return this.occupationsDictionary.get(id);
  }

  getPlace(id : string) {
    return this.placesDictionary.get(id);
  }

  // TRAVERSAL FUNCTIONS

  getIndividualById(id : string) {
    return this.individualsArray.find(individual => individual.id === id);
  }

  findLinks(individualId : string, from : string, to : string) {
    const family = (
      (
        this.pedigreeLinks.find(
          ((link : any) => link && link.$ && link.$.Individual === individualId && link.$.PedigreeLink === from)
        ) || {}
      ).$ || {}
    ).Family;
    
    return this.pedigreeLinks
      .filter((link : any) => link && link.$ && link.$.PedigreeLink === to && link.$.Family === family);
  }

  findParents (individualId : string) {
    return this.findLinks(individualId, 'Biological', 'Parent')
      .map((link : any) => link.$.Individual);
  }

  findAncestors (individualId : string, collection: Array<any> = [], level = 0) {
    const links = this.findLinks(individualId, 'Biological', 'Parent');
    const ancestors = links.map((node : any) => this.getIndividualById(node.$.Individual));
    
    collection[level] = [...(collection[level] || []), ...ancestors];

    const parents = links.map((link : any) => link.$.Individual);
    parents.forEach((parent : string) => {
      this.findAncestors(parent, collection, level + 1); // recursive
    })

    return collection;
  }

  getBirthdayDatesMap(includeDead : boolean = false) {
    const birthdates: Map<string, Array<Individual>> = new Map();
    this.individualsArray.filter(individual => includeDead || !individual.isDead).forEach((individual) => {
      const date = moment(individual.birthDate);
  
      if (individual.birthDate.length > 9 && date.isValid()) { 
        // Set the year to the current one so that we can celebrate birthday
        date.set({'year': new Date().getFullYear()});
        const dateStr = date.format('YYYY/MM/DD');
  
        if (!birthdates.get(dateStr)) {
          birthdates.set(dateStr, []);
        }
        
        birthdates.get(dateStr)?.push(individual);
      }
    });

    return birthdates;
  }

  getNodeById(collection : any, id : string) {
    return collection.filter((node : any) => {
      return node.$.ID === id;
    })[0];
  };

  getBaseCoordinates() {
    const coords = this.getXmlData().GenoPro.GenoMaps.GenoMap[0].$.BoundaryRect.split(',');

    return {
      x: Math.min(coords[0], coords[2]),
      y: -Math.max(coords[1], coords[3]),
      width: Math.abs(coords[0]) + Math.abs(coords[2]),
      height: Math.abs(coords[1]) + Math.abs(coords[3]),
    };
  }
}

export default GenoProFile;