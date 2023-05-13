use pyo3::exceptions::PyValueError;
use pyo3::prelude::*;

/// Convert an MJML string to an HTML string
#[pyfunction]
#[pyo3(signature = (input, minify = false))]
fn to_html(input: String, minify: bool) -> PyResult<String> {
    let parsed = mrml::parse(input).map_err(to_value_error)?;
    let rendered = parsed.render(&Default::default()).map_err(to_value_error)?;

    if minify {
        let mut cfg = minify_html::Cfg::spec_compliant();
        cfg.keep_closing_tags = true;

        let minified = minify_html::minify(rendered.as_bytes(), &cfg);
        String::from_utf8(minified).map_err(to_value_error)
    } else {
        Ok(rendered)
    }
}

/// Utilities for dealing with MJML
#[pymodule]
fn pymjml(_py: Python, m: &PyModule) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(to_html, m)?)?;

    Ok(())
}

fn to_value_error<E>(err: E) -> PyErr
where
    E: std::error::Error + 'static,
{
    PyValueError::new_err(err.to_string())
}
