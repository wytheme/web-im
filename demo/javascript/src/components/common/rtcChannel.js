var React = require("react");
var ReactDOM = require('react-dom');
var Drag = require('./drag');

var Channel = React.createClass({
    getInitialState: function () {
        return {
            localFullRemoteCorner: false,
            toggle_left: 0,
            toggle_top: 0,
            toggle_display: 'none',
            close_right: 0,
            close_bottom: 0,
            accept_left: 0,
            accept_bottom: 0,
            accept_display: 'block'
        };
    },

    close: function () {
        var local = this.props.localStream;
        var remote = this.props.remoteStream;

        if (remote) {
            remote.getAudioTracks()[0].stop();
            remote.getVideoTracks()[0].stop();
        }

        if (local) {
            local.getAudioTracks()[0].stop();
            local.getVideoTracks()[0].stop();
        }

        try {
            Demo.call.endCall();
        } catch (e) {
        }

        this.props.close();
    },

    accept: function () {
        Demo.call.acceptCall();
    },

    toggle: function () {
        this.setState({localFullRemoteCorner: !this.state.localFullRemoteCorner});
    },

    setStream: function (props) {

        this.refs.remoteVideo.srcObject = props.remoteStream;
        this.refs.localVideo.srcObject = props.localStream;


    },


    componentWillReceiveProps: function (nextProps) {
        console.log('componentWillReceiveProps', nextProps);
        this.setStream(nextProps);
    },

    componentDidUpdate: function () {
        console.log('did update');

        var me = this;
        this.refs.localVideo.oncanplay = function () {
            me.refs.localVideo.play();
            console.log('localVideo', me.refs.localVideo.getBoundingClientRect());

        };

        this.refs.remoteVideo.oncanplay = function () {
            me.refs.remoteVideo.play();
            console.log('remoteVideo', me.refs.remoteVideo.getBoundingClientRect());
            var rect = me.refs.remoteVideo.getBoundingClientRect();
            me.setState({
                close_right: rect.width / 2 - 6,
                toggle_display: 'block',
                accept_display: 'none'
            });
        };

    },

    componentDidMount: function () {
        console.log('did mount');
        new Drag(this.refs.rtc);
        this.resetButtonPosition();
    },

    resetButtonPosition: function () {
        var rect = this.refs.remoteVideo.getBoundingClientRect();
        this.setState({
            toggle_left: rect.width / 2 - 6,
            toggle_top: 6,
            close_right: 6,
            close_bottom: 6,
            accept_left: 6,
            accept_bottom: 6
        });
    },

    render: function () {

        var localClassName = this.state.localFullRemoteCorner ? 'full' : 'corner';
        var remoteClassName = this.state.localFullRemoteCorner ? 'corner' : 'full';
        return (
            <div ref='rtc' className='webim-rtc-video'>
                <video ref='localVideo' className={localClassName}/>
                <video ref='remoteVideo' className={remoteClassName}/>
                <i ref='close' className='font small' style={{
                    left: 'auto',
                    right: this.state.close_right + 'px',
                    top: 'auto',
                    bottom: this.state.close_bottom + 'px'
                }} onClick={this.close}>Q</i>
                <i ref='accept' className='font small' style={{
                    display: this.state.accept_display,
                    left: this.state.accept_left + 'px',
                    right: 'auto',
                    top: 'auto',
                    bottom: this.state.accept_bottom + 'px'
                }} onClick={this.accept}>z</i>
                <i ref='toggle' className='font small toggle'
                   style={{
                       display: this.state.toggle_display,
                       left: this.state.toggle_left + 'px',
                       right: 'auto',
                       top: this.state.toggle_top + 'px',
                       bottom: 'auto'
                   }} onClick={this.toggle}>d</i>
            </div>
        );
    }
});

module.exports = function (dom) {
    var me = this;
    me.dom = dom;

    return {
        setLocal: function (stream) {
            this.localStream = stream;

            ReactDOM.render(
                <Channel close={this.close} localStream={this.localStream} remoteStream={this.remoteStream}/>,
                me.dom
            );
        },
        setRemote: function (stream) {
            this.remoteStream = stream;

            ReactDOM.render(
                <Channel close={this.close} localStream={this.localStream} remoteStream={this.remoteStream}/>,
                me.dom
            );
        },
        close: function () {
            var local = this.localStream;
            var remote = this.remoteStream;

            if (remote) {
                remote.getAudioTracks()[0].stop();
                remote.getVideoTracks()[0].stop();
            }

            if (local) {
                local.getAudioTracks()[0].stop();
                local.getVideoTracks()[0].stop();
            }

            ReactDOM.unmountComponentAtNode(me.dom);
        }
    };
};
