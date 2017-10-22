import Hammer from 'hammerjs/src/main'
import {mixinEventEmitter, log} from '@theatersoft/bus'

const stack = [] // stack of sinks
let sink = {}

const focus = new (mixinEventEmitter(class {
    constructor () {
        this.hammer = new Hammer(document.getElementById('ui'))
            .on("tap press panright panleft panend swipeleft swiperight", e => {
                log(e.type, e)
                if (sink.onGesture) sink.onGesture(e)
            })
        document.onkeydown = e => {
            if (sink.onKeydown) sink.onKeydown(e)
        }
    }

    push (name) {
        stack.push({name})
        this.emit('focused', name)
    }

    pop () {
        if (stack.length > 1) {
            stack.pop()
            const top = stack[stack.length - 1]
            sink = top.sink
            this.emit('focused', top.name)
        }
    }

    register (_sink, name) {
        console.log('focus.register', name)
        sink = stack[stack.length - 1].sink = _sink
    }
}))

export default focus

import {Component} from 'preact'

export function mixinFocusable (Base) {
    return class extends Base {
        constructor (...args) {
            super(...args)
        }

        componentDidMount () {
            focus.register(this, this.props.name) // TODO should autopush as well
        }

        onGesture (e) {
            console.log('mixinFocusable.onGesture', e)
        }

        onKeydown (e) {
            console.log('mixinFocusable.onKeydown', e)
        }
    }
}

export class Focuser extends Component {
    constructor (props) {
        super(props)
        this.map = props.items
            .reduce((o, i) => (o[i.attributes.name] = i, o), {})
        focus.on('focused', focused =>
            this.setState({focused}))
        this.state = {focused: props.focused}
    }

    render ({}, {focused}) {
        console.log('Focuser.render', focused)
        return this.map[focused] // Focuser child should autofocus when mounted
    }
}

window.addEventListener('contextmenu', e => e.preventDefault())
