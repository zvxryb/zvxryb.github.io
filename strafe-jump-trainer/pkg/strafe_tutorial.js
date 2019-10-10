(function() {
    const __exports = {};
    let wasm;

    const heap = new Array(32);

    heap.fill(undefined);

    heap.push(undefined, null, true, false);

    let heap_next = heap.length;

    function addHeapObject(obj) {
        if (heap_next === heap.length) heap.push(heap.length + 1);
        const idx = heap_next;
        heap_next = heap[idx];

        heap[idx] = obj;
        return idx;
    }
    function __wbg_elem_binding0(arg0, arg1, arg2) {
        wasm.__wbg_function_table.get(193)(arg0, arg1, addHeapObject(arg2));
    }
    function __wbg_elem_binding1(arg0, arg1) {
        wasm.__wbg_function_table.get(197)(arg0, arg1);
    }
    function __wbg_elem_binding2(arg0, arg1, arg2) {
        wasm.__wbg_function_table.get(193)(arg0, arg1, addHeapObject(arg2));
    }
    /**
    */
    __exports.strafe_main = function() {
        wasm.strafe_main();
    };

function getObject(idx) { return heap[idx]; }

function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

let cachedTextDecoder = new TextDecoder('utf-8');

let cachegetUint8Memory = null;
function getUint8Memory() {
    if (cachegetUint8Memory === null || cachegetUint8Memory.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory;
}

function getStringFromWasm(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory().subarray(ptr, ptr + len));
}

function handleError(e) {
    wasm.__wbindgen_exn_store(addHeapObject(e));
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

let WASM_VECTOR_LEN = 0;

let cachedTextEncoder = new TextEncoder('utf-8');

let passStringToWasm;
if (typeof cachedTextEncoder.encodeInto === 'function') {
    passStringToWasm = function(arg) {


        let size = arg.length;
        let ptr = wasm.__wbindgen_malloc(size);
        let offset = 0;
        {
            const mem = getUint8Memory();
            for (; offset < arg.length; offset++) {
                const code = arg.charCodeAt(offset);
                if (code > 0x7F) break;
                mem[ptr + offset] = code;
            }
        }

        if (offset !== arg.length) {
            arg = arg.slice(offset);
            ptr = wasm.__wbindgen_realloc(ptr, size, size = offset + arg.length * 3);
            const view = getUint8Memory().subarray(ptr + offset, ptr + size);
            const ret = cachedTextEncoder.encodeInto(arg, view);

            offset += ret.written;
        }
        WASM_VECTOR_LEN = offset;
        return ptr;
    };
} else {
    passStringToWasm = function(arg) {


        let size = arg.length;
        let ptr = wasm.__wbindgen_malloc(size);
        let offset = 0;
        {
            const mem = getUint8Memory();
            for (; offset < arg.length; offset++) {
                const code = arg.charCodeAt(offset);
                if (code > 0x7F) break;
                mem[ptr + offset] = code;
            }
        }

        if (offset !== arg.length) {
            const buf = cachedTextEncoder.encode(arg.slice(offset));
            ptr = wasm.__wbindgen_realloc(ptr, size, size = offset + buf.length);
            getUint8Memory().set(buf, ptr + offset);
            offset += buf.length;
        }
        WASM_VECTOR_LEN = offset;
        return ptr;
    };
}

let cachegetInt32Memory = null;
function getInt32Memory() {
    if (cachegetInt32Memory === null || cachegetInt32Memory.buffer !== wasm.memory.buffer) {
        cachegetInt32Memory = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32Memory;
}

let cachegetFloat32Memory = null;
function getFloat32Memory() {
    if (cachegetFloat32Memory === null || cachegetFloat32Memory.buffer !== wasm.memory.buffer) {
        cachegetFloat32Memory = new Float32Array(wasm.memory.buffer);
    }
    return cachegetFloat32Memory;
}

function getArrayF32FromWasm(ptr, len) {
    return getFloat32Memory().subarray(ptr / 4, ptr / 4 + len);
}

function getArrayU8FromWasm(ptr, len) {
    return getUint8Memory().subarray(ptr / 1, ptr / 1 + len);
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function init(module) {

    let result;
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };
    imports.wbg.__wbg_error_ffa92c9d501bcb6a = function(arg0, arg1) {
        console.error(getStringFromWasm(arg0, arg1));
    };
    imports.wbg.__wbg_log_dba55c6068bc5a61 = function(arg0, arg1) {
        console.log(getStringFromWasm(arg0, arg1));
    };
    imports.wbg.__wbindgen_object_clone_ref = function(arg0) {
        const ret = getObject(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_cb_drop = function(arg0) {
        const obj = takeObject(arg0).original;
        if (obj.cnt-- == 1) {
            obj.a = 0;
            return true;
        }
        const ret = false;
        return ret;
    };
    imports.wbg.__wbindgen_is_function = function(arg0) {
        const ret = typeof(getObject(arg0)) === 'function';
        return ret;
    };
    imports.wbg.__wbg_warn_7a5867ecf26180a5 = function(arg0, arg1) {
        console.warn(getStringFromWasm(arg0, arg1));
    };
    imports.wbg.__wbindgen_cb_forget = function(arg0) {
        takeObject(arg0);
    };
    imports.wbg.__widl_instanceof_Window = function(arg0) {
        const ret = getObject(arg0) instanceof Window;
        return ret;
    };
    imports.wbg.__widl_f_add_1_DOMTokenList = function(arg0, arg1, arg2) {
        try {
            getObject(arg0).add(getStringFromWasm(arg1, arg2));
        } catch (e) {
            handleError(e)
        }
    };
    imports.wbg.__widl_f_remove_1_DOMTokenList = function(arg0, arg1, arg2) {
        try {
            getObject(arg0).remove(getStringFromWasm(arg1, arg2));
        } catch (e) {
            handleError(e)
        }
    };
    imports.wbg.__widl_f_exit_pointer_lock_Document = function(arg0) {
        getObject(arg0).exitPointerLock();
    };
    imports.wbg.__widl_f_get_element_by_id_Document = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).getElementById(getStringFromWasm(arg1, arg2));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__widl_f_pointer_lock_element_Document = function(arg0) {
        const ret = getObject(arg0).pointerLockElement;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__widl_f_fullscreen_element_Document = function(arg0) {
        const ret = getObject(arg0).fullscreenElement;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__widl_instanceof_Element = function(arg0) {
        const ret = getObject(arg0) instanceof Element;
        return ret;
    };
    imports.wbg.__widl_f_request_fullscreen_Element = function(arg0) {
        try {
            getObject(arg0).requestFullscreen();
        } catch (e) {
            handleError(e)
        }
    };
    imports.wbg.__widl_f_request_pointer_lock_Element = function(arg0) {
        getObject(arg0).requestPointerLock();
    };
    imports.wbg.__widl_f_class_list_Element = function(arg0) {
        const ret = getObject(arg0).classList;
        return addHeapObject(ret);
    };
    imports.wbg.__widl_f_client_width_Element = function(arg0) {
        const ret = getObject(arg0).clientWidth;
        return ret;
    };
    imports.wbg.__widl_f_client_height_Element = function(arg0) {
        const ret = getObject(arg0).clientHeight;
        return ret;
    };
    imports.wbg.__widl_f_add_event_listener_with_callback_EventTarget = function(arg0, arg1, arg2, arg3) {
        try {
            getObject(arg0).addEventListener(getStringFromWasm(arg1, arg2), getObject(arg3));
        } catch (e) {
            handleError(e)
        }
    };
    imports.wbg.__widl_instanceof_HTMLButtonElement = function(arg0) {
        const ret = getObject(arg0) instanceof HTMLButtonElement;
        return ret;
    };
    imports.wbg.__widl_instanceof_HTMLCanvasElement = function(arg0) {
        const ret = getObject(arg0) instanceof HTMLCanvasElement;
        return ret;
    };
    imports.wbg.__widl_f_get_context_HTMLCanvasElement = function(arg0, arg1, arg2) {
        try {
            const ret = getObject(arg0).getContext(getStringFromWasm(arg1, arg2));
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        } catch (e) {
            handleError(e)
        }
    };
    imports.wbg.__widl_f_set_width_HTMLCanvasElement = function(arg0, arg1) {
        getObject(arg0).width = arg1 >>> 0;
    };
    imports.wbg.__widl_f_set_height_HTMLCanvasElement = function(arg0, arg1) {
        getObject(arg0).height = arg1 >>> 0;
    };
    imports.wbg.__widl_instanceof_HTMLDivElement = function(arg0) {
        const ret = getObject(arg0) instanceof HTMLDivElement;
        return ret;
    };
    imports.wbg.__widl_instanceof_HTMLElement = function(arg0) {
        const ret = getObject(arg0) instanceof HTMLElement;
        return ret;
    };
    imports.wbg.__widl_f_blur_HTMLElement = function(arg0) {
        try {
            getObject(arg0).blur();
        } catch (e) {
            handleError(e)
        }
    };
    imports.wbg.__widl_instanceof_HTMLInputElement = function(arg0) {
        const ret = getObject(arg0) instanceof HTMLInputElement;
        return ret;
    };
    imports.wbg.__widl_f_checked_HTMLInputElement = function(arg0) {
        const ret = getObject(arg0).checked;
        return ret;
    };
    imports.wbg.__widl_f_set_checked_HTMLInputElement = function(arg0, arg1) {
        getObject(arg0).checked = arg1 !== 0;
    };
    imports.wbg.__widl_f_set_disabled_HTMLInputElement = function(arg0, arg1) {
        getObject(arg0).disabled = arg1 !== 0;
    };
    imports.wbg.__widl_f_set_value_HTMLInputElement = function(arg0, arg1, arg2) {
        getObject(arg0).value = getStringFromWasm(arg1, arg2);
    };
    imports.wbg.__widl_f_value_as_number_HTMLInputElement = function(arg0) {
        const ret = getObject(arg0).valueAsNumber;
        return ret;
    };
    imports.wbg.__widl_f_set_value_as_number_HTMLInputElement = function(arg0, arg1) {
        getObject(arg0).valueAsNumber = arg1;
    };
    imports.wbg.__widl_instanceof_HTMLSelectElement = function(arg0) {
        const ret = getObject(arg0) instanceof HTMLSelectElement;
        return ret;
    };
    imports.wbg.__widl_f_value_HTMLSelectElement = function(arg0, arg1) {
        const ret = getObject(arg1).value;
        const ret0 = passStringToWasm(ret);
        const ret1 = WASM_VECTOR_LEN;
        getInt32Memory()[arg0 / 4 + 0] = ret0;
        getInt32Memory()[arg0 / 4 + 1] = ret1;
    };
    imports.wbg.__widl_f_set_value_HTMLSelectElement = function(arg0, arg1, arg2) {
        getObject(arg0).value = getStringFromWasm(arg1, arg2);
    };
    imports.wbg.__widl_f_code_KeyboardEvent = function(arg0, arg1) {
        const ret = getObject(arg1).code;
        const ret0 = passStringToWasm(ret);
        const ret1 = WASM_VECTOR_LEN;
        getInt32Memory()[arg0 / 4 + 0] = ret0;
        getInt32Memory()[arg0 / 4 + 1] = ret1;
    };
    imports.wbg.__widl_f_button_MouseEvent = function(arg0) {
        const ret = getObject(arg0).button;
        return ret;
    };
    imports.wbg.__widl_f_movement_x_MouseEvent = function(arg0) {
        const ret = getObject(arg0).movementX;
        return ret;
    };
    imports.wbg.__widl_f_movement_y_MouseEvent = function(arg0) {
        const ret = getObject(arg0).movementY;
        return ret;
    };
    imports.wbg.__widl_instanceof_Node = function(arg0) {
        const ret = getObject(arg0) instanceof Node;
        return ret;
    };
    imports.wbg.__widl_f_text_content_Node = function(arg0, arg1) {
        const ret = getObject(arg1).textContent;
        const ptr0 = isLikeNone(ret) ? 0 : passStringToWasm(ret);
        const len0 = WASM_VECTOR_LEN;
        const ret0 = ptr0;
        const ret1 = len0;
        getInt32Memory()[arg0 / 4 + 0] = ret0;
        getInt32Memory()[arg0 / 4 + 1] = ret1;
    };
    imports.wbg.__widl_f_set_text_content_Node = function(arg0, arg1, arg2) {
        getObject(arg0).textContent = arg1 === 0 ? undefined : getStringFromWasm(arg1, arg2);
    };
    imports.wbg.__widl_f_now_Performance = function(arg0) {
        const ret = getObject(arg0).now();
        return ret;
    };
    imports.wbg.__widl_f_get_item_Storage = function(arg0, arg1, arg2, arg3) {
        try {
            const ret = getObject(arg1).getItem(getStringFromWasm(arg2, arg3));
            const ptr0 = isLikeNone(ret) ? 0 : passStringToWasm(ret);
            const len0 = WASM_VECTOR_LEN;
            const ret0 = ptr0;
            const ret1 = len0;
            getInt32Memory()[arg0 / 4 + 0] = ret0;
            getInt32Memory()[arg0 / 4 + 1] = ret1;
        } catch (e) {
            handleError(e)
        }
    };
    imports.wbg.__widl_f_set_item_Storage = function(arg0, arg1, arg2, arg3, arg4) {
        try {
            getObject(arg0).setItem(getStringFromWasm(arg1, arg2), getStringFromWasm(arg3, arg4));
        } catch (e) {
            handleError(e)
        }
    };
    imports.wbg.__widl_instanceof_WebGL2RenderingContext = function(arg0) {
        const ret = getObject(arg0) instanceof WebGL2RenderingContext;
        return ret;
    };
    imports.wbg.__widl_f_begin_transform_feedback_WebGL2RenderingContext = function(arg0, arg1) {
        getObject(arg0).beginTransformFeedback(arg1 >>> 0);
    };
    imports.wbg.__widl_f_bind_buffer_base_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).bindBufferBase(arg1 >>> 0, arg2 >>> 0, getObject(arg3));
    };
    imports.wbg.__widl_f_buffer_data_with_i32_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).bufferData(arg1 >>> 0, arg2, arg3 >>> 0);
    };
    imports.wbg.__widl_f_buffer_data_with_array_buffer_view_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).bufferData(arg1 >>> 0, getObject(arg2), arg3 >>> 0);
    };
    imports.wbg.__widl_f_draw_arrays_instanced_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).drawArraysInstanced(arg1 >>> 0, arg2, arg3, arg4);
    };
    imports.wbg.__widl_f_end_transform_feedback_WebGL2RenderingContext = function(arg0) {
        getObject(arg0).endTransformFeedback();
    };
    imports.wbg.__widl_f_transform_feedback_varyings_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).transformFeedbackVaryings(getObject(arg1), getObject(arg2), arg3 >>> 0);
    };
    imports.wbg.__widl_f_uniform_matrix4fv_with_f32_array_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).uniformMatrix4fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm(arg3, arg4));
    };
    imports.wbg.__widl_f_vertex_attrib_divisor_WebGL2RenderingContext = function(arg0, arg1, arg2) {
        getObject(arg0).vertexAttribDivisor(arg1 >>> 0, arg2 >>> 0);
    };
    imports.wbg.__widl_f_attach_shader_WebGL2RenderingContext = function(arg0, arg1, arg2) {
        getObject(arg0).attachShader(getObject(arg1), getObject(arg2));
    };
    imports.wbg.__widl_f_bind_buffer_WebGL2RenderingContext = function(arg0, arg1, arg2) {
        getObject(arg0).bindBuffer(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__widl_f_blend_func_WebGL2RenderingContext = function(arg0, arg1, arg2) {
        getObject(arg0).blendFunc(arg1 >>> 0, arg2 >>> 0);
    };
    imports.wbg.__widl_f_clear_WebGL2RenderingContext = function(arg0, arg1) {
        getObject(arg0).clear(arg1 >>> 0);
    };
    imports.wbg.__widl_f_clear_color_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).clearColor(arg1, arg2, arg3, arg4);
    };
    imports.wbg.__widl_f_compile_shader_WebGL2RenderingContext = function(arg0, arg1) {
        getObject(arg0).compileShader(getObject(arg1));
    };
    imports.wbg.__widl_f_create_buffer_WebGL2RenderingContext = function(arg0) {
        const ret = getObject(arg0).createBuffer();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__widl_f_create_program_WebGL2RenderingContext = function(arg0) {
        const ret = getObject(arg0).createProgram();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__widl_f_create_shader_WebGL2RenderingContext = function(arg0, arg1) {
        const ret = getObject(arg0).createShader(arg1 >>> 0);
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__widl_f_cull_face_WebGL2RenderingContext = function(arg0, arg1) {
        getObject(arg0).cullFace(arg1 >>> 0);
    };
    imports.wbg.__widl_f_depth_func_WebGL2RenderingContext = function(arg0, arg1) {
        getObject(arg0).depthFunc(arg1 >>> 0);
    };
    imports.wbg.__widl_f_disable_WebGL2RenderingContext = function(arg0, arg1) {
        getObject(arg0).disable(arg1 >>> 0);
    };
    imports.wbg.__widl_f_disable_vertex_attrib_array_WebGL2RenderingContext = function(arg0, arg1) {
        getObject(arg0).disableVertexAttribArray(arg1 >>> 0);
    };
    imports.wbg.__widl_f_draw_arrays_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).drawArrays(arg1 >>> 0, arg2, arg3);
    };
    imports.wbg.__widl_f_enable_WebGL2RenderingContext = function(arg0, arg1) {
        getObject(arg0).enable(arg1 >>> 0);
    };
    imports.wbg.__widl_f_enable_vertex_attrib_array_WebGL2RenderingContext = function(arg0, arg1) {
        getObject(arg0).enableVertexAttribArray(arg1 >>> 0);
    };
    imports.wbg.__widl_f_get_active_attrib_WebGL2RenderingContext = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).getActiveAttrib(getObject(arg1), arg2 >>> 0);
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__widl_f_get_active_uniform_WebGL2RenderingContext = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).getActiveUniform(getObject(arg1), arg2 >>> 0);
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__widl_f_get_attrib_location_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3) {
        const ret = getObject(arg0).getAttribLocation(getObject(arg1), getStringFromWasm(arg2, arg3));
        return ret;
    };
    imports.wbg.__widl_f_get_extension_WebGL2RenderingContext = function(arg0, arg1, arg2) {
        try {
            const ret = getObject(arg0).getExtension(getStringFromWasm(arg1, arg2));
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        } catch (e) {
            handleError(e)
        }
    };
    imports.wbg.__widl_f_get_program_info_log_WebGL2RenderingContext = function(arg0, arg1, arg2) {
        const ret = getObject(arg1).getProgramInfoLog(getObject(arg2));
        const ptr0 = isLikeNone(ret) ? 0 : passStringToWasm(ret);
        const len0 = WASM_VECTOR_LEN;
        const ret0 = ptr0;
        const ret1 = len0;
        getInt32Memory()[arg0 / 4 + 0] = ret0;
        getInt32Memory()[arg0 / 4 + 1] = ret1;
    };
    imports.wbg.__widl_f_get_program_parameter_WebGL2RenderingContext = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).getProgramParameter(getObject(arg1), arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__widl_f_get_shader_info_log_WebGL2RenderingContext = function(arg0, arg1, arg2) {
        const ret = getObject(arg1).getShaderInfoLog(getObject(arg2));
        const ptr0 = isLikeNone(ret) ? 0 : passStringToWasm(ret);
        const len0 = WASM_VECTOR_LEN;
        const ret0 = ptr0;
        const ret1 = len0;
        getInt32Memory()[arg0 / 4 + 0] = ret0;
        getInt32Memory()[arg0 / 4 + 1] = ret1;
    };
    imports.wbg.__widl_f_get_shader_parameter_WebGL2RenderingContext = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).getShaderParameter(getObject(arg1), arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__widl_f_get_uniform_location_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3) {
        const ret = getObject(arg0).getUniformLocation(getObject(arg1), getStringFromWasm(arg2, arg3));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__widl_f_link_program_WebGL2RenderingContext = function(arg0, arg1) {
        getObject(arg0).linkProgram(getObject(arg1));
    };
    imports.wbg.__widl_f_shader_source_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).shaderSource(getObject(arg1), getStringFromWasm(arg2, arg3));
    };
    imports.wbg.__widl_f_uniform1f_WebGL2RenderingContext = function(arg0, arg1, arg2) {
        getObject(arg0).uniform1f(getObject(arg1), arg2);
    };
    imports.wbg.__widl_f_uniform2f_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).uniform2f(getObject(arg1), arg2, arg3);
    };
    imports.wbg.__widl_f_uniform3f_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).uniform3f(getObject(arg1), arg2, arg3, arg4);
    };
    imports.wbg.__widl_f_uniform4f_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).uniform4f(getObject(arg1), arg2, arg3, arg4, arg5);
    };
    imports.wbg.__widl_f_use_program_WebGL2RenderingContext = function(arg0, arg1) {
        getObject(arg0).useProgram(getObject(arg1));
    };
    imports.wbg.__widl_f_vertex_attrib1f_WebGL2RenderingContext = function(arg0, arg1, arg2) {
        getObject(arg0).vertexAttrib1f(arg1 >>> 0, arg2);
    };
    imports.wbg.__widl_f_vertex_attrib2f_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).vertexAttrib2f(arg1 >>> 0, arg2, arg3);
    };
    imports.wbg.__widl_f_vertex_attrib3f_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).vertexAttrib3f(arg1 >>> 0, arg2, arg3, arg4);
    };
    imports.wbg.__widl_f_vertex_attrib4f_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).vertexAttrib4f(arg1 >>> 0, arg2, arg3, arg4, arg5);
    };
    imports.wbg.__widl_f_vertex_attrib4fv_with_f32_array_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).vertexAttrib4fv(arg1 >>> 0, getArrayF32FromWasm(arg2, arg3));
    };
    imports.wbg.__widl_f_vertex_attrib_pointer_with_i32_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
        getObject(arg0).vertexAttribPointer(arg1 >>> 0, arg2, arg3 >>> 0, arg4 !== 0, arg5, arg6);
    };
    imports.wbg.__widl_f_viewport_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).viewport(arg1, arg2, arg3, arg4);
    };
    imports.wbg.__widl_f_size_WebGLActiveInfo = function(arg0) {
        const ret = getObject(arg0).size;
        return ret;
    };
    imports.wbg.__widl_f_type_WebGLActiveInfo = function(arg0) {
        const ret = getObject(arg0).type;
        return ret;
    };
    imports.wbg.__widl_f_name_WebGLActiveInfo = function(arg0, arg1) {
        const ret = getObject(arg1).name;
        const ret0 = passStringToWasm(ret);
        const ret1 = WASM_VECTOR_LEN;
        getInt32Memory()[arg0 / 4 + 0] = ret0;
        getInt32Memory()[arg0 / 4 + 1] = ret1;
    };
    imports.wbg.__widl_instanceof_WebGLRenderingContext = function(arg0) {
        const ret = getObject(arg0) instanceof WebGLRenderingContext;
        return ret;
    };
    imports.wbg.__widl_f_buffer_data_with_i32_WebGLRenderingContext = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).bufferData(arg1 >>> 0, arg2, arg3 >>> 0);
    };
    imports.wbg.__widl_f_buffer_data_with_array_buffer_view_WebGLRenderingContext = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).bufferData(arg1 >>> 0, getObject(arg2), arg3 >>> 0);
    };
    imports.wbg.__widl_f_uniform_matrix4fv_with_f32_array_WebGLRenderingContext = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).uniformMatrix4fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm(arg3, arg4));
    };
    imports.wbg.__widl_f_attach_shader_WebGLRenderingContext = function(arg0, arg1, arg2) {
        getObject(arg0).attachShader(getObject(arg1), getObject(arg2));
    };
    imports.wbg.__widl_f_bind_buffer_WebGLRenderingContext = function(arg0, arg1, arg2) {
        getObject(arg0).bindBuffer(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__widl_f_blend_func_WebGLRenderingContext = function(arg0, arg1, arg2) {
        getObject(arg0).blendFunc(arg1 >>> 0, arg2 >>> 0);
    };
    imports.wbg.__widl_f_clear_WebGLRenderingContext = function(arg0, arg1) {
        getObject(arg0).clear(arg1 >>> 0);
    };
    imports.wbg.__widl_f_clear_color_WebGLRenderingContext = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).clearColor(arg1, arg2, arg3, arg4);
    };
    imports.wbg.__widl_f_compile_shader_WebGLRenderingContext = function(arg0, arg1) {
        getObject(arg0).compileShader(getObject(arg1));
    };
    imports.wbg.__widl_f_create_buffer_WebGLRenderingContext = function(arg0) {
        const ret = getObject(arg0).createBuffer();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__widl_f_create_program_WebGLRenderingContext = function(arg0) {
        const ret = getObject(arg0).createProgram();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__widl_f_create_shader_WebGLRenderingContext = function(arg0, arg1) {
        const ret = getObject(arg0).createShader(arg1 >>> 0);
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__widl_f_cull_face_WebGLRenderingContext = function(arg0, arg1) {
        getObject(arg0).cullFace(arg1 >>> 0);
    };
    imports.wbg.__widl_f_depth_func_WebGLRenderingContext = function(arg0, arg1) {
        getObject(arg0).depthFunc(arg1 >>> 0);
    };
    imports.wbg.__widl_f_disable_WebGLRenderingContext = function(arg0, arg1) {
        getObject(arg0).disable(arg1 >>> 0);
    };
    imports.wbg.__widl_f_disable_vertex_attrib_array_WebGLRenderingContext = function(arg0, arg1) {
        getObject(arg0).disableVertexAttribArray(arg1 >>> 0);
    };
    imports.wbg.__widl_f_draw_arrays_WebGLRenderingContext = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).drawArrays(arg1 >>> 0, arg2, arg3);
    };
    imports.wbg.__widl_f_enable_WebGLRenderingContext = function(arg0, arg1) {
        getObject(arg0).enable(arg1 >>> 0);
    };
    imports.wbg.__widl_f_enable_vertex_attrib_array_WebGLRenderingContext = function(arg0, arg1) {
        getObject(arg0).enableVertexAttribArray(arg1 >>> 0);
    };
    imports.wbg.__widl_f_get_active_attrib_WebGLRenderingContext = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).getActiveAttrib(getObject(arg1), arg2 >>> 0);
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__widl_f_get_active_uniform_WebGLRenderingContext = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).getActiveUniform(getObject(arg1), arg2 >>> 0);
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__widl_f_get_attrib_location_WebGLRenderingContext = function(arg0, arg1, arg2, arg3) {
        const ret = getObject(arg0).getAttribLocation(getObject(arg1), getStringFromWasm(arg2, arg3));
        return ret;
    };
    imports.wbg.__widl_f_get_extension_WebGLRenderingContext = function(arg0, arg1, arg2) {
        try {
            const ret = getObject(arg0).getExtension(getStringFromWasm(arg1, arg2));
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        } catch (e) {
            handleError(e)
        }
    };
    imports.wbg.__widl_f_get_program_info_log_WebGLRenderingContext = function(arg0, arg1, arg2) {
        const ret = getObject(arg1).getProgramInfoLog(getObject(arg2));
        const ptr0 = isLikeNone(ret) ? 0 : passStringToWasm(ret);
        const len0 = WASM_VECTOR_LEN;
        const ret0 = ptr0;
        const ret1 = len0;
        getInt32Memory()[arg0 / 4 + 0] = ret0;
        getInt32Memory()[arg0 / 4 + 1] = ret1;
    };
    imports.wbg.__widl_f_get_program_parameter_WebGLRenderingContext = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).getProgramParameter(getObject(arg1), arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__widl_f_get_shader_info_log_WebGLRenderingContext = function(arg0, arg1, arg2) {
        const ret = getObject(arg1).getShaderInfoLog(getObject(arg2));
        const ptr0 = isLikeNone(ret) ? 0 : passStringToWasm(ret);
        const len0 = WASM_VECTOR_LEN;
        const ret0 = ptr0;
        const ret1 = len0;
        getInt32Memory()[arg0 / 4 + 0] = ret0;
        getInt32Memory()[arg0 / 4 + 1] = ret1;
    };
    imports.wbg.__widl_f_get_shader_parameter_WebGLRenderingContext = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).getShaderParameter(getObject(arg1), arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__widl_f_get_uniform_location_WebGLRenderingContext = function(arg0, arg1, arg2, arg3) {
        const ret = getObject(arg0).getUniformLocation(getObject(arg1), getStringFromWasm(arg2, arg3));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__widl_f_link_program_WebGLRenderingContext = function(arg0, arg1) {
        getObject(arg0).linkProgram(getObject(arg1));
    };
    imports.wbg.__widl_f_shader_source_WebGLRenderingContext = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).shaderSource(getObject(arg1), getStringFromWasm(arg2, arg3));
    };
    imports.wbg.__widl_f_uniform1f_WebGLRenderingContext = function(arg0, arg1, arg2) {
        getObject(arg0).uniform1f(getObject(arg1), arg2);
    };
    imports.wbg.__widl_f_uniform2f_WebGLRenderingContext = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).uniform2f(getObject(arg1), arg2, arg3);
    };
    imports.wbg.__widl_f_uniform3f_WebGLRenderingContext = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).uniform3f(getObject(arg1), arg2, arg3, arg4);
    };
    imports.wbg.__widl_f_uniform4f_WebGLRenderingContext = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).uniform4f(getObject(arg1), arg2, arg3, arg4, arg5);
    };
    imports.wbg.__widl_f_use_program_WebGLRenderingContext = function(arg0, arg1) {
        getObject(arg0).useProgram(getObject(arg1));
    };
    imports.wbg.__widl_f_vertex_attrib1f_WebGLRenderingContext = function(arg0, arg1, arg2) {
        getObject(arg0).vertexAttrib1f(arg1 >>> 0, arg2);
    };
    imports.wbg.__widl_f_vertex_attrib2f_WebGLRenderingContext = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).vertexAttrib2f(arg1 >>> 0, arg2, arg3);
    };
    imports.wbg.__widl_f_vertex_attrib3f_WebGLRenderingContext = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).vertexAttrib3f(arg1 >>> 0, arg2, arg3, arg4);
    };
    imports.wbg.__widl_f_vertex_attrib4f_WebGLRenderingContext = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).vertexAttrib4f(arg1 >>> 0, arg2, arg3, arg4, arg5);
    };
    imports.wbg.__widl_f_vertex_attrib4fv_with_f32_array_WebGLRenderingContext = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).vertexAttrib4fv(arg1 >>> 0, getArrayF32FromWasm(arg2, arg3));
    };
    imports.wbg.__widl_f_vertex_attrib_pointer_with_i32_WebGLRenderingContext = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
        getObject(arg0).vertexAttribPointer(arg1 >>> 0, arg2, arg3 >>> 0, arg4 !== 0, arg5, arg6);
    };
    imports.wbg.__widl_f_viewport_WebGLRenderingContext = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).viewport(arg1, arg2, arg3, arg4);
    };
    imports.wbg.__widl_f_request_animation_frame_Window = function(arg0, arg1) {
        try {
            const ret = getObject(arg0).requestAnimationFrame(getObject(arg1));
            return ret;
        } catch (e) {
            handleError(e)
        }
    };
    imports.wbg.__widl_f_document_Window = function(arg0) {
        const ret = getObject(arg0).document;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__widl_f_performance_Window = function(arg0) {
        const ret = getObject(arg0).performance;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__widl_f_local_storage_Window = function(arg0) {
        try {
            const ret = getObject(arg0).localStorage;
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        } catch (e) {
            handleError(e)
        }
    };
    imports.wbg.__wbg_getRandomValues_f724b5822126eff7 = function(arg0, arg1, arg2) {
        getObject(arg0).getRandomValues(getArrayU8FromWasm(arg1, arg2));
    };
    imports.wbg.__wbg_randomFillSync_eae3007264ffc138 = function(arg0, arg1, arg2) {
        getObject(arg0).randomFillSync(getArrayU8FromWasm(arg1, arg2));
    };
    imports.wbg.__wbg_self_1801c027cb0e6124 = function() {
        try {
            const ret = self.self;
            return addHeapObject(ret);
        } catch (e) {
            handleError(e)
        }
    };
    imports.wbg.__wbg_require_e89d842e759f0a4c = function(arg0, arg1) {
        const ret = require(getStringFromWasm(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_crypto_3e91f24788b1203d = function(arg0) {
        const ret = getObject(arg0).crypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_is_undefined = function(arg0) {
        const ret = getObject(arg0) === undefined;
        return ret;
    };
    imports.wbg.__wbg_getRandomValues_7ecea3ecacbb2f9e = function(arg0) {
        const ret = getObject(arg0).getRandomValues;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_call_4499dca0c553c196 = function(arg0, arg1) {
        try {
            const ret = getObject(arg0).call(getObject(arg1));
            return addHeapObject(ret);
        } catch (e) {
            handleError(e)
        }
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        const ret = getStringFromWasm(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_f802c5ff9d449d95 = function() {
        const ret = new Array();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_push_4ba6b2636acd5f79 = function(arg0, arg1) {
        const ret = getObject(arg0).push(getObject(arg1));
        return ret;
    };
    imports.wbg.__wbg_newnoargs_6ad69a50998c5acb = function(arg0, arg1) {
        const ret = new Function(getStringFromWasm(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_is_138935bb43af9b75 = function(arg0, arg1) {
        const ret = Object.is(getObject(arg0), getObject(arg1));
        return ret;
    };
    imports.wbg.__wbg_globalThis_36c1f2e85948e420 = function() {
        try {
            const ret = globalThis.globalThis;
            return addHeapObject(ret);
        } catch (e) {
            handleError(e)
        }
    };
    imports.wbg.__wbg_self_73c7a601ff857345 = function() {
        try {
            const ret = self.self;
            return addHeapObject(ret);
        } catch (e) {
            handleError(e)
        }
    };
    imports.wbg.__wbg_window_ca735e04cb2b0566 = function() {
        try {
            const ret = window.window;
            return addHeapObject(ret);
        } catch (e) {
            handleError(e)
        }
    };
    imports.wbg.__wbg_global_99312a595fd2e761 = function() {
        try {
            const ret = global.global;
            return addHeapObject(ret);
        } catch (e) {
            handleError(e)
        }
    };
    imports.wbg.__wbg_buffer_d31feadf69cb45fc = function(arg0) {
        const ret = getObject(arg0).buffer;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_bac57664fe087b80 = function(arg0, arg1, arg2) {
        const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_59cb74e423758ede = function() {
        const ret = new Error();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_stack_558ba5917b466edd = function(arg0, arg1) {
        const ret = getObject(arg1).stack;
        const ret0 = passStringToWasm(ret);
        const ret1 = WASM_VECTOR_LEN;
        getInt32Memory()[arg0 / 4 + 0] = ret0;
        getInt32Memory()[arg0 / 4 + 1] = ret1;
    };
    imports.wbg.__wbg_error_4bb6c2a97407129a = function(arg0, arg1) {
        const v0 = getStringFromWasm(arg0, arg1).slice();
        wasm.__wbindgen_free(arg0, arg1 * 1);
        console.error(v0);
    };
    imports.wbg.__wbindgen_number_get = function(arg0, arg1) {
        const obj = getObject(arg0);
        if (typeof(obj) === 'number') return obj;
        getUint8Memory()[arg1] = 1;
        const ret = 0;
        return ret;
    };
    imports.wbg.__wbindgen_boolean_get = function(arg0) {
        const v = getObject(arg0);
        const ret = typeof(v) === 'boolean' ? (v ? 1 : 0) : 2;
        return ret;
    };
    imports.wbg.__wbindgen_debug_string = function(arg0, arg1) {
        const ret = debugString(getObject(arg1));
        const ret0 = passStringToWasm(ret);
        const ret1 = WASM_VECTOR_LEN;
        getInt32Memory()[arg0 / 4 + 0] = ret0;
        getInt32Memory()[arg0 / 4 + 1] = ret1;
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm(arg0, arg1));
    };
    imports.wbg.__wbindgen_memory = function() {
        const ret = wasm.memory;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper391 = function(arg0, arg1, arg2) {
        const state = { a: arg0, b: arg1, cnt: 1 };
        const real = () => {
            state.cnt++;
            const a = state.a;
            state.a = 0;
            try {
                return __wbg_elem_binding1(a, state.b, );
            } finally {
                if (--state.cnt === 0) wasm.__wbg_function_table.get(194)(a, state.b);
                else state.a = a;
            }
        }
        ;
        real.original = state;
        const ret = real;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper393 = function(arg0, arg1, arg2) {
        const state = { a: arg0, b: arg1, cnt: 1 };
        const real = (arg0) => {
            state.cnt++;
            const a = state.a;
            state.a = 0;
            try {
                return __wbg_elem_binding0(a, state.b, arg0);
            } finally {
                if (--state.cnt === 0) wasm.__wbg_function_table.get(194)(a, state.b);
                else state.a = a;
            }
        }
        ;
        real.original = state;
        const ret = real;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper389 = function(arg0, arg1, arg2) {
        const state = { a: arg0, b: arg1, cnt: 1 };
        const real = (arg0) => {
            state.cnt++;
            const a = state.a;
            state.a = 0;
            try {
                return __wbg_elem_binding2(a, state.b, arg0);
            } finally {
                if (--state.cnt === 0) wasm.__wbg_function_table.get(194)(a, state.b);
                else state.a = a;
            }
        }
        ;
        real.original = state;
        const ret = real;
        return addHeapObject(ret);
    };

    if ((typeof URL === 'function' && module instanceof URL) || typeof module === 'string' || (typeof Request === 'function' && module instanceof Request)) {

        const response = fetch(module);
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            result = WebAssembly.instantiateStreaming(response, imports)
            .catch(e => {
                return response
                .then(r => {
                    if (r.headers.get('Content-Type') != 'application/wasm') {
                        console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);
                        return r.arrayBuffer();
                    } else {
                        throw e;
                    }
                })
                .then(bytes => WebAssembly.instantiate(bytes, imports));
            });
        } else {
            result = response
            .then(r => r.arrayBuffer())
            .then(bytes => WebAssembly.instantiate(bytes, imports));
        }
    } else {

        result = WebAssembly.instantiate(module, imports)
        .then(result => {
            if (result instanceof WebAssembly.Instance) {
                return { instance: result, module };
            } else {
                return result;
            }
        });
    }
    return result.then(({instance, module}) => {
        wasm = instance.exports;
        init.__wbindgen_wasm_module = module;

        return wasm;
    });
}

self.wasm_bindgen = Object.assign(init, __exports);

})();
