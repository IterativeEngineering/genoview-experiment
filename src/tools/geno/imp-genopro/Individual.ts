import { duration } from 'moment';

import Individual from '../interface/Individual';
import { showText } from '../utils/utils';

class GenoProIndividual implements Individual {
  data: any;
  geno: any;
  
  constructor(data : any, geno: any) {
    this.data = data;
    this.geno = geno;
  }

  private getPrimaryPictureId() {
    return this.data.Pictures ? this.data.Pictures.$.Primary : undefined;
  }

  private getPictureIds() {
    return this.data.Pictures ? (this.data.Pictures._ || '').split(',').map((p : any) => p.trim())  : [];
  }

  public get firstName() {
    return showText(this.data.Name?.First);
  }

  public get middleName() {
    return showText(this.data.Name?.Middle);
  }

  public get lastName() {
    return showText(this.data.Name?.Last);
  }

  public get displayName() {
    return showText(this.data.Name);
  }

  public get primaryPicture() {
    return this.geno.getPicture(this.getPrimaryPictureId());
  }

  public get pictures() {
    return this.getPictureIds()
      .map((pictureId : string) => this.geno.getPicture(pictureId));
  }

  public get occupation() {
    return this.geno.getOccupation(this.data.Occupations)?.Title;
  }

  public get birthPlace() {
    return this.geno.getPlace(this.data.Birth?.Place)?.Name;
  }

  public get deathPlace() {
    return this.geno.getPlace(this.data.Death?.Place)?.Name;
  }

  public get hyperlink() {
    return this.data.Hyperlink;
  }

  public get id() {
    return this.data.$.ID;
  }

  public get position() {
    return {
      x: this.data.Position._.split(',')[0],
      y: -this.data.Position._.split(',')[1],
    };
  }

  public get age() {
    if (!this.data.Birth) {
      return '';
    }
    const birthDate = Date.parse(this.data.Birth.Date);

    if (isNaN(birthDate)) {
      return '';
    }
    let endDate = Date.now();

    if (this.data.IsDead === 'Y') {
      if (this.data.Death && this.data.Death.Date) {
        endDate = Date.parse(this.data.Death.Date);
      } else {
        return '';
      }
    }
    return duration(endDate - birthDate).years() || (duration(endDate - birthDate).months() + 'm');
  }

  get birthDate() {
    return this.data.Birth && this.data.Birth.Date ? this.data.Birth.Date : '';
  }

  get deathDate() {
    return this.data.Death && this.data.Death.Date ? this.data.Death.Date : '';
  }

  get comment() {
    return this.data.Comment || '';
  }

  get isDead() {
    return this.data.IsDead;
  }

  get gender() {
    return this.data.Gender;
  }
}

export default GenoProIndividual;
