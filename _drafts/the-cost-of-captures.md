---
layout: post
section: Blog
title: The Cost of Captures
subtitle: Benchmarking C++ functors in GCC, Clang, and MSVC
plot_functor_alloc:
    labels: [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 68, 72, 76]
    datasets:
      - title: gcc 7.2.0
        values: [3.8, 6.4, 6.7, 6.9, 6.9, 44.9, 45.6, 51.8, 61.9, 59.3, 52.9, 57.4, 58.9, 59.2, 62.7, 63.4, 59.2, 58.9, 64.9, 65.2]
      - title: clang 5.0.0
        values: [2.8, 2.8, 6.6, 6.2, 2.9, 49.5, 49.8, 60.1, 55.4, 56.9, 56.8, 66.0, 62.1, 63.1, 62.8, 73.1, 70.5, 63.6, 62.6, 71.6]
      - title: msvc 2017
        values: [13.6, 13.3, 13.4, 14.3, 13.3, 13.5, 15.3, 15.9, 14.7, 15.2, 14.1, 13.9, 15.0, 61.5, 63.1, 62.5, 65.0, 68.1, 70.5, 70.6]
plot_functor_invoke:
    labels: [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 68, 72, 76]
    datasets:
      - title: gcc 7.2.0
        values: [3.3, 2.2, 2.3, 2.3, 2.2, 2.3, 2.3, 2.5, 3.0, 2.8, 2.3, 2.2, 2.5, 2.4, 2.4, 2.3, 2.3, 2.1, 2.2, 2.2]
      - title: clang 5.0.0
        values: [2.3, 2.2, 2.3, 2.1, 2.1, 2.1, 2.2, 2.2, 2.2, 2.2, 2.3, 2.1, 2.3, 2.3, 2.2, 2.2, 2.3, 2.3, 2.2, 2.2]
      - title: msvc 2017
        values: [3.5, 3.3, 3.3, 3.4, 3.6, 3.3, 3.8, 3.7, 3.6, 3.6, 3.3, 3.6, 3.5, 9.1, 9.1, 9.0, 9.1, 9.2, 10.1, 9.4]
---
One of the most powerfully expressive features of modern C++ is the lambda, often used with its std::function wrapper.  These functional tools are readily employed in writing generic, reusable code.  As asynchronous computing becomes more and more important to make the most of our multi-threaded CPU and GPU resources, these functors also find use in asynchronous event handlers and task distribution/scheduling systems.

What is the cost of all these function objects?  The ability to capture arbitrary data implies that, at some point, we must incur a heap allocation.  I would expect, however, that the majority of captures should be relatively small, in which case the obvious optimization is to provide a small, fixed-size storage area within the functor itself to enable stack allocation within these limits.  Some quick searching appears to support this (see Futher Reading below), but at what point does this degrade to heap allocation in practice, and *just how bad is it?*

In this post I'll analyze the performance characteristics of functors of varying capture sizes to determine under what conditions we begin to observe performance degredation.

<!--continue-->

# Test Details

The test consists of creating and assigning 10,000,000 functors to an array in a tight loop, measuring total duration, capturing an integer array of varying size (up to 20).  The "zero size" capture is handled specially as a lambda with no array capture.  The functors do nothing and return no result.  After the array of functors has been created/assigned, it is iterated over and each is called, again measuring total duration.  A "control" is also measured, where we repeat the process with a regular function pointer instead of a lambda/functor.

Results are reported with durations specified for the average time of a single iteration (total time divided by number if elements).  All tests conducted on a Windows 10 system with an Intel Core i5, 6600K processor.

## Toolchains

| Toolchain | Version       | Platform | Arguments        | Notes                       |
| --------- | ------------- | -------- | ---------------- | --------------------------- |
| gcc       | 7.2.0         | mingw64  | `-O2 -std=c++14` |                             |
| clang     | 5.0.0         | mingw64  | `-O2 -std=c++14` | using libstdc++, not libc++ |
| msvc (cl) | 19.11.25508.2 | x64      | `/O2 /EHsc`      |                             |

## Source

{% include source.html id='test-functor-source' path='/blog/resources/closure_benchmark.cpp' language='c++' %}

# Results

## Allocation

{% include graph.html id='plot-functor-alloc' title='Functor Allocation Time (ns)' type='bar' data=page.plot_functor_alloc %}

We observe similar results for GCC and Clang, as we are using the same standard library for both (libstdc++); performance is quite good (~3-7ns) up to 16 bytes of capture data, jumping to ~45-70ns when allocating functors with captures >16 bytes.

MSVC performs substantially worse for small captures (~13-15ns), but performance doesn't degrade until beyond 48 bytes of capture data.  MSVC outperforms GCC/Clang (libstdc++) for captures in the (16, 48] byte range, but performs comparably (or slightly worse) for other test cases.

Control durations for this test were 0.8ns (gcc), 0.6ns (clang), and 0.3ns (msvc).

## Invocation

{% include graph.html id='plot-functor-invoke' title='Functor Invokation Time (ns)' type='bar' data=page.plot_functor_invoke %}

This result is particularly interesting; I expected performance degration during the allocation test, but expected invocation to suffer no penalty from large captures.  While this is what we see from GCC/Clang, MSVC jumps from ~3-4ns, for small captures, to ~9-10ns for captures >48 bytes.  I'm not sure what is happening here, but I think it's beyond the scope of this post.

Control durations for this test were 1.5ns for each compiler tested.

## Conclusions

When performance is a concern, it is best to keep capture data under 16 bytes to get optimal performance across compilers.  MSVC is able to handle up to 48 bytes of data, but it has worse allocation performance for small captures (&le;16 bytes) and worse invocation performance for large captures (>48 bytes).

# Further Reading
* <https://shaharmike.com/cpp/lambdas-and-functions/>
* <https://blog.demofox.org/2015/02/25/avoiding-the-performance-hazzards-of-stdfunction/>