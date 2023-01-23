import React, { useEffect } from 'react';
import SVGViewer from '../../tools/geno/vis/svg';
import GenoProFile from '../../tools/geno/imp-genopro/GenoProFile';

interface GenoDiagramProps {
  onIndividualClick: Function;
  onCanvasClick: Function;
  data: GenoProFile;
}

export const GenoDiagram = ((props : GenoDiagramProps) => {
  const ref = React.useRef(null);
  const { data, onIndividualClick, onCanvasClick } = props;

  useEffect(() => {
    const svg = new SVGViewer();

    svg.attach(ref.current, data);
    svg.setOnIndividualClick((show: boolean, individual: any) => {
      svg.toggleIndividual(show, individual);
      onIndividualClick(individual);
    });
    svg.setOnCanvasClick(() => {
      svg.toggleIndividual(false);
      onCanvasClick();
    });

    return () => {
      svg.cleanup();
    }
  // eslint-disable-next-line
  }, [ data ]); 

  return <svg width="100%" height="100%" ref={ref} />;
})
