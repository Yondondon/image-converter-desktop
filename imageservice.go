package main

import (
	"fmt"
	"image"
	"image/color"
	"image/draw"
	"image/jpeg"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"sync"

	"golang.org/x/image/webp"
)

type ImageService struct{}

type ConvertResult struct {
	Source string `json:"source"`
	Output string `json:"output,omitempty"`
	Error  string `json:"error,omitempty"`
}

func (s *ImageService) Convert(paths []string, quality int) ([]ConvertResult, error) {
	if quality < 1 || quality > 100 {
		return nil, fmt.Errorf("quality must be in range 1-100, got %d", quality)
	}

	dsts := planOutputs(paths)

	results := make([]ConvertResult, len(paths))
	sem := make(chan struct{}, runtime.NumCPU())
	var wg sync.WaitGroup

	for i, src := range paths {
		wg.Add(1)
		sem <- struct{}{}
		go func(i int, src, dst string) {
			defer wg.Done()
			defer func() { <-sem }()

			res := ConvertResult{Source: src}
			if err := convertOne(src, dst, quality); err != nil {
				res.Error = err.Error()
			} else {
				res.Output = dst
			}
			results[i] = res
		}(i, src, dsts[i])
	}
	wg.Wait()

	return results, nil
}

func planOutputs(paths []string) []string {
	used := make(map[string]bool, len(paths))
	for _, p := range paths {
		used[strings.ToLower(p)] = true
	}

	dsts := make([]string, len(paths))
	for i, p := range paths {
		base := strings.TrimSuffix(p, filepath.Ext(p))
		dst := base + ".jpg"
		for n := 1; used[strings.ToLower(dst)] || fileExists(dst); n++ {
			dst = fmt.Sprintf("%s_converted%d.jpg", base, n)
		}
		used[strings.ToLower(dst)] = true
		dsts[i] = dst
	}
	return dsts
}

func fileExists(p string) bool {
	_, err := os.Stat(p)
	return err == nil
}

func convertOne(src, dst string, quality int) error {
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()

	img, err := webp.Decode(in)
	if err != nil {
		return fmt.Errorf("not valid WebP")
	}

	out, err := os.Create(dst)
	if err != nil {
		return err
	}

	err = jpeg.Encode(out, flattenOnWhite(img), &jpeg.Options{Quality: quality})
	if cerr := out.Close(); err == nil {
		err = cerr
	}
	if err != nil {
		os.Remove(dst)
		return err
	}
	return nil
}

func flattenOnWhite(img image.Image) image.Image {
	b := img.Bounds()
	dst := image.NewRGBA(b)
	draw.Draw(dst, b, image.NewUniform(color.White), image.Point{}, draw.Src)
	draw.Draw(dst, b, img, b.Min, draw.Over)
	return dst
}
