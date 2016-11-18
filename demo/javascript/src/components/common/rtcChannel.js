var React = require("react");
var ReactDOM = require('react-dom');
var Drag = require('./drag');

var Channel = React.createClass({
    getInitialState: function () {
        return {
            localFullRemoteCorner: this.props.localFullRemoteCorner,
            full_width: 400,
            full_height: 400,
            toggle_right: 0,
            toggle_top: 0,
            toggle_display: 'none',
            close_right: 0,
            close_bottom: 0,
            accept_left: 0,
            accept_bottom: 0,
            accept_display: this.props.hideAccept ? 'none' : 'block'
        };
    },

    close: function () {
        //close stream and camera first
        this.props.close();

        try {
            Demo.call.endCall();
        } catch (e) {
            console.log('endCall error1:', e);
        }


    },

    accept: function () {
        Demo.call.acceptCall();
    },

    toggle: function () {
        // console.log('toggle', this.local_width, '*', this.local_height, ',', this.remote_width, '*', this.remote_height);
        if (this.state.full_width == this.local_width && this.state.full_height == this.local_height) {
            this.state.full_width = this.remote_width;
            this.state.full_height = this.remote_height;
        } else {
            this.state.full_width = this.local_width;
            this.state.full_height = this.local_height;
        }
        this.setState({
            localFullRemoteCorner: !this.state.localFullRemoteCorner,
            full_width: this.state.full_width,
            full_height: this.state.full_height
        });
    },

    setStream: function (props) {

        this.refs.remoteVideo.srcObject = props.remoteStream;
        this.refs.localVideo.srcObject = props.localStream;


    },


    componentWillReceiveProps: function (nextProps) {
        console.log('componentWillReceiveProps', nextProps);
        this.setStream(nextProps);
    },


    componentDidMount: function () {
        console.log('did mount', this.props);
        new Drag(this.refs.rtc);
        this.resetButtonPosition();

        var localVideo = this.refs.localVideo;
        var remoteVideo = this.refs.remoteVideo;


        remoteVideo.addEventListener('canplay', this.canplayRemoteHandler);

        //caution: |this| differ between addEventListener + anonymous function and addEventListener + non-anonymous function
        localVideo.addEventListener('loadedmetadata', this.loadedmetadataLocalHandler);

        remoteVideo.addEventListener('loadedmetadata', this.loadedmetadataRemoteHandler);

        localVideo.addEventListener('resize', this.resizeLocalHandler);

        remoteVideo.addEventListener('resize', this.resizeRemoteHandler);


    },

    componentWillUnmount: function () {
        var localVideo = this.refs.localVideo;
        var remoteVideo = this.refs.remoteVideo;


        remoteVideo.removeEventListener('canplay', this.canplayRemoteHandler);

        localVideo.removeEventListener('loadedmetadata', this.loadedmetadataLocalHandler);

        remoteVideo.removeEventListener('loadedmetadata', this.loadedmetadataRemoteHandler);

        localVideo.removeEventListener('resize', this.resizeLocalHandler);

        remoteVideo.removeEventListener('resize', this.resizeRemoteHandler);
    },

    canplayRemoteHandler: function () {

        this.setState({
            toggle_display: 'block',
            accept_display: 'none'
        });
    },


    loadedmetadataLocalHandler: function () {
        var video = this.refs.localVideo;

        this.local_width = video.videoWidth;
        this.local_height = video.videoHeight;
        this.setState({
            full_width: video.videoWidth,
            full_height: video.videoHeight,
        });
    },


    loadedmetadataRemoteHandler: function () {

        var video = this.refs.remoteVideo;
        this.remote_width = video.videoWidth;
        this.remote_height = video.videoHeight;
        this.setState({
            full_width: video.videoWidth,
            full_height: video.videoHeight,
        });
    },


    resizeLocalHandler: function () {
        var video = this.refs.localVideo;

        if (this.state.localFullRemoteCorner) {
            this.local_width = video.videoWidth;
            this.local_height = video.videoHeight;
            this.setState({
                full_width: video.videoWidth,
                full_height: video.videoHeight,
            });
        }
    },

    resizeRemoteHandler: function () {
        var video = this.refs.remoteVideo;

        if (!this.state.localFullRemoteCorner) {
            this.remote_width = video.videoWidth;
            this.remote_height = video.videoHeight;
            this.setState({
                full_width: video.videoWidth,
                full_height: video.videoHeight,
            });
        }
    },


    resetButtonPosition: function () {
        this.setState({
            toggle_right: 6,
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
            <div ref='rtc' className='webim-rtc-video'
                 style={{width: this.state.full_width + 'px', height: this.state.full_height + 'px'}}>
                <video ref='localVideo' className={localClassName} muted autoPlay/>
                <video ref='remoteVideo' className={remoteClassName} autoPlay/>
                <span>{this.props.title}</span>
                <i ref='close' id='webrtc_close' className='font small' style={{
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
                       left: 'auto',
                       right: this.state.toggle_right + 'px',
                       top: this.state.toggle_top + 'px',
                       bottom: 'auto'
                   }} onClick={this.toggle}>d</i>
            </div>
        );
    }
});

module.exports = function (dom) {
    this.dom = dom;
    var me = this;
    return {
        setLocal: function (stream) {
            console.log('channel setLocal', Demo.user, Demo.call.caller, Demo.call.callee);
            this.localStream = stream;
            var title = '';
            var hideAccept = false;
            var localFullRemoteCorner = false;
            if (Demo.user == Demo.call.caller) {
                title = '等候 ' + Demo.call.callee.split('@')[0].split('_')[1] + ' 视频中...';
                hideAccept = true;
            } else {
                title = Demo.call.callee.split('@')[0].split('_')[1];
            }
            ReactDOM.render(
                <Channel close={this.close} localStream={this.localStream} remoteStream={this.remoteStream}
                         title={title} hideAccept={hideAccept} localFullRemoteCorner={localFullRemoteCorner}/>,
                me.dom
            );
        },
        setRemote: function (stream) {
            console.log('channel setRemote', Demo.user, Demo.call.caller, Demo.call.callee);
            this.remoteStream = stream;
            var title = '';
            var localFullRemoteCorner = false;
            if (Demo.call.caller != '' && Demo.call.caller == Demo.user) {
                title = Demo.call.callee.split('@')[0].split('_')[1];
            } else {
                title = Demo.call.callee.split('@')[0].split('_')[1] + ' 请求视频通话...';
            }
            ReactDOM.render(
                <Channel close={this.close} localStream={this.localStream} remoteStream={this.remoteStream}
                         title={title} localFullRemoteCorner={localFullRemoteCorner}/>,
                me.dom
            );
        },
        close: function () {
            var local = this.localStream;
            var remote = this.remoteStream;

            if (remote) {
                remote.getTracks().forEach(function (track) {
                    track.stop();
                });
            }

            if (local) {
                local.getTracks().forEach(function (track) {
                    track.stop();
                });
            }

            ReactDOM.unmountComponentAtNode(me.dom);
        }
    };
};
