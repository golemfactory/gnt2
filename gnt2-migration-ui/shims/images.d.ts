type SvgrComponent = React.FC<React.SVGAttributes<SVGElement>>;

declare module '*.svg' {
  export const ReactComponent: SvgrComponent;
  const url: string;
  export default url;
}

declare module '*.jpg' {
  const url: string;
  export default url;
}

declare module '*.png' {
  const url: string;
  export default url;
}

declare module '*.ttf' {
  const url: string;
  export default url;
}

declare module '*.woff' {
  const url: string;
  export default url;
}

declare module '*.woff2' {
  const url: string;
  export default url;
}

declare module '*.eot' {
  const url: string;
  export default url;
}
