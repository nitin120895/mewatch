import { RouteProps } from 'react-router';
import { Component } from 'react';
/**
 * Extending React Router's Route component to allow a path to be a string or function.
 * This allows us to specifiy a function to lazy resolve a Route path from a
 * dynamic sitemap loaded at runtime.
 *
 * See:
 *  - src/shared/pathResolver.js
 *  - build/react-router-patch.js
 */
export interface CustomRouteProps extends RouteProps {
	getPath?: any;
	template?: string;
}

export default class Route extends Component<CustomRouteProps, any> {}
