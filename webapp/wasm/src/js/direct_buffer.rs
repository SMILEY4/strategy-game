use js_sys::Uint8Array;
use wasm_bindgen::prelude::wasm_bindgen;

/// Generic memory allocation handle passed to JS.
#[wasm_bindgen]
pub struct DirectMemoryHandle {
    /// the pointer to the memory
    pub ptr: usize,
    // the amount of individual entries
    pub len: usize,
    // the size in bytes of a single entry
    pub item_size: usize,
}

pub struct DirectBuffer;

/// Raw buffer for receiving bulk data from js.
///
/// # Note on memory management
/// With *reserve* the memory is removed from the normal rust memory management and will no longer be handled and freed automatically.
/// Only when calling *upload* is the memory handed back to rust and "freed" after the "upload" function is done.
///
/// # Safety Rules
/// - JS must write exact amount of elements - no more, no less.
/// - JS must not read from the buffer after upload() is called (the Rust Vec may reallocate/free).
/// - upload must be called exactly once per reserve - otherwise memory leaks or double-frees.
impl DirectBuffer {

    /// Reserves memory for a Vec of T without dropping it, returning a raw handle.
    pub fn reserve<T>(len: usize) -> DirectMemoryHandle {
        let mut vec: Vec<T> = Vec::with_capacity(len);
        let ptr = vec.as_mut_ptr() as usize;
        std::mem::forget(vec);
        DirectMemoryHandle {
            ptr,
            len,
            item_size: size_of::<T>(),
        }
    }

    /// Reclaims raw memory allocated via `reserve` and converts it back into a `Vec<T>`.
    ///
    /// # Safety
    /// Must only be called with pointers originally allocated via `DirectBuffer::reserve<T>`
    /// with matching element count and type T.
    pub unsafe fn upload<T>(ptr: usize, len: usize) -> Vec<T> {
        unsafe {
            Vec::from_raw_parts(ptr as *mut T, len, len)
        }
    }
}

pub fn as_js_buffer<T>(vertices: &Vec<T>) -> Uint8Array {
    let byte_len = vertices.len() * size_of::<T>();
    let ptr = vertices.as_ptr() as *const u8;
    unsafe { Uint8Array::view(std::slice::from_raw_parts(ptr, byte_len)) }
}