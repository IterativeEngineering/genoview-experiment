import * as d3 from 'd3';
import './style.css';

class SvgViewer {
  constructor() {
    this.svg = undefined;
    this.canvas = undefined;
    this.geno = undefined;

    this.onIndividualClick = this.toggleIndividual.bind(this);
    this.onCanvasClick = this.toggleIndividual.bind(this);
    this.onRelationshipClick = this.toggleRelationship.bind(this);
  }

  setOnIndividualClick(callback) {
    this.onIndividualClick = this.caaallback;
  }

  setOnRelationshipClick(callback) {
    this.onRelationshipClick = callback;
  }

  setOnCanvasClick(callback) {
    this.onCanvasClick = callback;
  }

  cleanup() {
    this.svg.selectAll('*').remove();
  }

  getDisplayClass(data) {
    let type = 'individual';

    switch (data.gender) {
    case 'M':
      type += ' male';
      break;
    case 'F':
      type += ' female';
      break;
    default:
      type += ' pet';
    }

    if (data.isDead === 'Y') {
      type += ' dead';
    }
    return type;
  }

  attach(container, geno) {
    this.geno = geno;
    const { x, y, width, height } = geno.getBaseCoordinates();

    // CANVAS
    const svg = d3.select(container)
      .attr('viewBox', `${x} ${y} ${width} ${height}`);

    const canvas = svg.append('g')
      .attr('class', 'geno-canvas');

    this.svg = svg;
    this.canvas = canvas;

    this.zooming = d3.zoom().on('zoom', () => {
      canvas.attr('transform', d3.event.transform);
      this.currentTransform = d3.event.transform;
      let previousTransform = {};
      try {
        previousTransform = JSON.parse(localStorage.getItem('currentTransform'));
      } catch(e) {};
      localStorage.setItem('currentTransform', JSON.stringify({...previousTransform, [geno.getFileName()]: this.currentTransform}));
    });

    svg.call(this.zooming);
    if (localStorage.getItem('currentTransform')) {
      this.currentTransform = JSON.parse(localStorage.getItem('currentTransform'));
      if (this.currentTransform[geno.getFileName()]) {
        this.zoomTo(this.currentTransform[geno.getFileName()]);
      }
    }

    svg.on('click', () => {
      this.onCanvasClick();
    });


    // PEDIGREE LINKS
    const pedigreeLinksContainer = canvas.append('g')
      .attr('class', 'pedigree-links');

    const pedigreeLink = pedigreeLinksContainer.selectAll('svg');

    pedigreeLink
      .data(geno.getPedigreeLinks())
      .enter()
      .append('g')
      .attr('id', node => `pedigree-link-${node.$.Family}-${node.$.Individual}`) 
      .append('line')
      .attr('class', 'pedigree-link')
      .classed('adopted', d => d.$.PedigreeLink === 'Adopted')
      .attr('x1', (d) => {
        return geno.getNodeById(geno.getXmlData().GenoPro.Individuals.Individual, d.$.Individual).Position._.split(',')[0];
      })
      .attr('y1', (d) => {
        return -1 * geno.getNodeById(geno.getXmlData().GenoPro.Families.Family, d.$.Family).Position._.split(',')[1];
      })
      .attr('x2', (d) => {
        return geno.getNodeById(geno.getXmlData().GenoPro.Individuals.Individual, d.$.Individual).Position._.split(',')[0];
      })
      .attr('y2', (d) => {
        return -1 * geno.getNodeById(geno.getXmlData().GenoPro.Individuals.Individual, d.$.Individual).Position._.split(',')[1];
      });


    // FAMILY LINKS
    const familyLinksContainer = canvas.append('g')
      .attr('class', 'family-links');

    const familyLink = familyLinksContainer.selectAll('svg')
      .data(geno.getXmlData().GenoPro.Families.Family)
      .enter()
      .append('g')
      .attr('class', 'family-link')
      .attr('id', node => node.$.ID)
      .classed('divorced', d => d.Relation === 'Divorce')
      .on('click', (d) => {
        this.onRelationshipClick(true, d);
        d3.event.stopPropagation();
      });

    familyLink.append('line')
      .attr('x1', d => d.Position.Top.Left.split(',')[0])
      .attr('y1', d => -d.Position.Top.Left.split(',')[1])
      .attr('x2', d => d.Position.Top.Right.split(',')[0])
      .attr('y2', d => -d.Position.Top.Right.split(',')[1]);

    familyLink.append('text')
      .attr('x', d => Math.min(d.Position.Top.Left.split(',')[0], d.Position.Top.Right.split(',')[0]) + Math.abs(d.Position.Top.Left.split(',')[0] - d.Position.Top.Right.split(',')[0])/2)
      .attr('y', d => -d.Position.Top.Right.split(',')[1] - 5)
      .text(d => d.DisplayText);


    // INDIVIDUALS
    const individualsContainer = canvas.append('g')
      .attr('class', 'individuals');

    const individual = individualsContainer.selectAll('svg')
      .data(geno.getIndividuals())
      .enter()
      .append('g')
      .attr('id', node => node.id)
      .attr('class', node => this.getDisplayClass(node))
      .on('click', (d) => {
        this.onIndividualClick(true, d);
        d3.event.stopPropagation();
      });

    individual
      .append('circle')
      .attr('r', 12)
      .attr('cx', node => node.position.x)
      .attr('cy', node => node.position.y);

    individual
      .append('text')
      .attr('class', 'birth-date')
      .attr('x', node => node.position.x)
      .attr('y', node => node.position.y - (node.deathDate ? 30 : 18))
      .text(node => node.birthDate);

    individual
      .append('text')
      .attr('class', 'death-date')
      .attr('dx', '-0.3em')
      .attr('x', node => node.position.x)
      .attr('y', node => node.position.y - 18)
      .text(node => node.deathDate ? `+${node.deathDate}` : '');

    individual
      .append('text')
      .attr('class', 'age')
      .attr('x', node => node.position.x)
      .attr('y', node => node.position.y + 5)
      .text(node => node.age);

    const individualName = individual.append('text')
      .attr('x', node => node.position.x)
      .attr('y', node => node.position.y + 12)
      .attr('font-size', 6)
      .style('text-anchor', 'middle')
      .attr('class', node => node.hyperlink ? 'name hyperlink' : 'name')
      .on('click', node => {
        if (node.hyperlink) {
          window.location = `?file=${node.hyperlink.replace('.gno', '.xml')}`;
        }
      });

    individualName
      .append('tspan')
      .attr('dy', '2.2ex')
      .attr('x', node => node.position.x)
      .text(node => node.firstName ? node.firstName : '');

    individualName
      .append('tspan')
      .attr('dy', '2.2ex')
      .attr('x', node => node.position.x)
      .text(node => node.middleName ? node.middleName : '');

    individualName
      .append('tspan')
      .attr('dy', '2.2ex')
      .attr('x', node => node.position.x)
      .text(node => node.lastName ? node.lastName : '');
  }

  zoomTo(transform) {
    this.svg.call(this.zooming.transform, d3.zoomIdentity.translate(transform.x, transform.y).scale(transform.k));
    this.canvas.attr('transform', `translate(${transform.x}, ${transform.y})scale(${transform.k})`);
  }

  toggleIndividual(show, individual, shouldZoom = false, event = false) {
    this.svg.selectAll(".selected").classed("selected", false);
    this.svg.selectAll(".ancestor").classed("ancestor", false);

    if (individual) {
      const individualNode = this.svg.select(`#${individual.id}`);
      individualNode.classed("selected", true);

      if (shouldZoom) {
        const bbox = individualNode.node().getBBox();
        const scale = 8;
    
        this.zoomTo({
          x: (- bbox.x - bbox.width / 2) * scale,
          y: (- bbox.y - bbox.height / 2) * scale,
          k: scale,
        });
      }

      this.highlightAncestors(individual.id);
    }
  }

  toggleRelationship(show, relationship) {
    this.svg.selectAll(".selected").classed("selected", false);
    this.svg.selectAll(".ancestor").classed("ancestor", false);

    if (relationship) {
      this.svg.select(`#${relationship.$.ID}`).classed("selected", true);
    }
  }

  highlightAncestors (individualId) {
    const links = this.geno.findLinks(individualId, 'Biological', 'Parent');

    links.forEach((link) => {
      this.svg.select(`#${link.$.Family}`).classed("ancestor", true);
      this.svg.select(`#${link.$.Individual}`).classed("ancestor", true);
      this.svg.select(`#pedigree-link-${link.$.Family}-${link.$.Individual}`).classed("ancestor", true);
    })

    const parents = links.map((link) => link.$.Individual);
    parents.forEach((parent) => {
      const children = this.geno.findLinks(parent, 'Parent', 'Biological');
      children.filter(link => link.$.Individual === individualId).forEach((link) => {
        this.svg.select(`#pedigree-link-${link.$.Family}-${link.$.Individual}`).classed("ancestor", true);
      })

      this.highlightAncestors(parent);
    })
  }

  zoomToExtent() {
    this.svg.transition()
      .duration(750)
      .call(this.zooming.transform, d3.zoomIdentity);
  }

  zoomIn() {
    this.zooming.scaleBy(this.svg.transition().duration(450), 1.5);
  };

  zoomOut() {
    this.zooming.scaleBy(this.svg.transition().duration(450), 1 / 1.5);
  };

}

export default SvgViewer;