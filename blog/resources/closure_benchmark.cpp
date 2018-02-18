// mlodato, 20180210

#include <array>
#include <chrono>
#include <functional>
#include <iomanip>
#include <iostream>
#include <utility>
#include <tuple>
#include <vector>

void control() {}

class timer final {
public:
    timer(long long &);
    ~timer();

private:
    using clock = std::chrono::high_resolution_clock;
    using time = clock::time_point;
    using duration = clock::duration;

    long long &_result_ns;
    time _start;
};

timer::timer(long long &result_ns)
    : _result_ns{result_ns}
    , _start{clock::now()}
{}

timer::~timer() {
    auto dt = clock::now() - _start;
    _result_ns = std::chrono::duration_cast<std::chrono::nanoseconds>(dt).count();
}

struct test_result {
    int size;
    long long alloc_ns;
    long long invoke_ns;
};

constexpr int test_max_size = 20;
constexpr size_t test_count = 10000000;
using test_type = uint32_t;
using test_results = std::array<test_result, test_max_size>;

template <size_t n>
class test_alloc final {
public:
    static void test(std::vector<std::function<void ()>> &fs, test_result &result) {
        test_type xs[n];
        auto m = fs.size();
        
        timer _{result.alloc_ns};
        for (decltype(m) i = 0; i < m; ++i)
            fs[i] = [xs]{};
    }
};

template <>
class test_alloc<0> final {
public:
    static void test(std::vector<std::function<void ()>> &fs, test_result &result) {
        auto m = fs.size();
        
        timer _{result.alloc_ns};
        for (decltype(m) i = 0; i < m; ++i)
            fs[i] = []{};
    }
};

template <size_t n>
void test(test_results &results) {
    auto &result = results.at(n);
    result.size = n * sizeof(test_type);

    {
        std::vector<std::function<void ()>> fs{test_count};
        test_alloc<n>::test(fs, result);
        
        auto m = fs.size();
        {
            timer _{result.invoke_ns};
            for (decltype(m) i = 0; i < m; ++i)
                fs[i]();
        }
    }
}

template <size_t... is>
void test_each(test_results &results, std::index_sequence<is...>) {
    int _[]{(test<is>(results), 0)...};
}

int main(int, char const *[]) {
    {
        std::vector<void (*)()> fs{test_count};
        
        long long alloc_ns{0};
        {
            timer _{alloc_ns};
            for (size_t i = 0; i < test_count; ++i)
                fs[i] = &control;
        }
        std::cout << "control alloc: " << std::fixed << std::setw(5) << std::setprecision(1)
            << static_cast<double>(alloc_ns) / test_count << "ns" << std::endl;
        
        long long invoke_ns{0};
        {
            timer _{invoke_ns};
            for (size_t i = 0; i < test_count; ++i)
                fs[i]();
        }
        std::cout << "control invoke: " << std::fixed << std::setw(5) << std::setprecision(1)
            << static_cast<double>(invoke_ns) / test_count << "ns" << std::endl;
    }

    test_results results;
    test_each(results, std::make_index_sequence<test_max_size>{});

    for (auto &&result : results)
        std::cout << std::setw(5) << result.size << " ";
    std::cout << std::endl;

    for (auto &&result : results)
        std::cout << std::fixed << std::setw(5) << std::setprecision(1)
            << static_cast<double>(result.alloc_ns) / test_count << " ";
    std::cout << std::endl;

    for (auto &&result : results)
        std::cout << std::fixed << std::setw(5) << std::setprecision(1)
            << static_cast<double>(result.invoke_ns) / test_count << " ";
    std::cout << std::endl;

    return 0;
}