import { Component } from 'react';

export class Loading extends Component {
  
  constructor(props) {
    super(props);
    this.state = {hidden: true};
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
  }

  show() {
    this.setState({hidden: false});
  }

  hide() {
    this.setState({hidden: true});
  }

  render() {
    return this.state.hidden ? null : (
      <div className={'fixed bg-white/50 z-20 w-screen h-screen'}>
        <div className={'flex justify-center items-center h-screen'}>
          <div className={'spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full'} role="status">
            <span className={'visually-hidden'}>Kontrollin...</span>
          </div>
        </div>
      </div>
    );
  }
}