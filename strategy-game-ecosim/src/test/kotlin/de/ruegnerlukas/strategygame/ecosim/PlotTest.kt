package de.ruegnerlukas.strategygame.ecosim

import com.github.sh0nk.matplotlib4j.NumpyUtils
import com.github.sh0nk.matplotlib4j.Plot
import io.kotest.core.spec.style.StringSpec

class PlotTest : StringSpec({

    "sample plot" {

        val x = NumpyUtils.linspace(1.0, 100.0, 100)
        val y = x.map { v -> 1.0/v }

        val plt = Plot.create()
        plt.plot().add(x, y)
        plt.show()
    }

})